from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase
from models import QuizModel, QuizSubmission, ResultResponse, QuizCreate

app = FastAPI(title="Quiz App API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/quizzes", response_model=List[QuizModel])
def get_quizzes():
    try:
        response = supabase.table("quizzes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quizzes/{quiz_id}", response_model=QuizModel)
def get_quiz_details(quiz_id: str):
    try:
        # Fetch quiz
        quiz_res = supabase.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not quiz_res.data:
            raise HTTPException(status_code=404, detail="Quiz not found")
        quiz = quiz_res.data[0]

        # Fetch questions and options (we exclude is_correct so users don't cheat)
        questions_res = supabase.table("questions").select("id, text").eq("quiz_id", quiz_id).execute()
        questions = questions_res.data
        
        for q in questions:
            options_res = supabase.table("options").select("id, text").eq("question_id", q['id']).execute()
            q['options'] = options_res.data
        
        quiz['questions'] = questions
        return quiz

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quizzes/submit", response_model=ResultResponse)
def submit_quiz(submission: QuizSubmission):
    try:
        # Get total questions for this quiz accurately
        questions_res = supabase.table("questions").select("id").eq("quiz_id", submission.quiz_id).execute()
        total_questions = len(questions_res.data) if questions_res.data else 0

        # Check if already submitted
        existing = supabase.table("results").select("id").eq("user_id", submission.user_id).eq("quiz_id", submission.quiz_id).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="You have already submitted this quiz.")

        # Calculate score
        score = 0
        correct_answers_details = []

        # Find all correct options for the quiz to build details and compare
        for q in questions_res.data:
            correct_opt_res = supabase.table("options").select("id, text").eq("question_id", q['id']).eq("is_correct", True).execute()
            if correct_opt_res.data:
                correct_answers_details.append({
                    "question_id": q['id'],
                    "correct_option_id": correct_opt_res.data[0]["id"],
                    "correct_option_text": correct_opt_res.data[0]["text"]
                })

        for ans in submission.answers:
            # Check if answer is correct
            opt_res = supabase.table("options").select("is_correct").eq("id", ans.selected_option_id).execute()
            if opt_res.data:
                is_correct = opt_res.data[0].get("is_correct", False)
                if is_correct:
                    score += 1

        # Insert result into database
        supabase.table("results").insert({
            "user_id": submission.user_id,
            "quiz_id": submission.quiz_id,
            "score": score,
            "total_questions": total_questions
        }).execute()

        return ResultResponse(
            score=score,
            total_questions=total_questions,
            correct_answers=correct_answers_details
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

security = HTTPBearer()

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        res = supabase.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        profile_res = supabase.table("profiles").select("role").eq("id", res.user.id).execute()
        if not profile_res.data or profile_res.data[0].get('role') != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized as admin")
            
        return res.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/api/admin/quizzes/{quiz_id}", response_model=QuizModel)
def get_admin_quiz_details(quiz_id: str, user=Depends(get_admin_user)):
    try:
        quiz_res = supabase.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not quiz_res.data:
            raise HTTPException(status_code=404, detail="Quiz not found")
        quiz = quiz_res.data[0]

        questions_res = supabase.table("questions").select("id, text").eq("quiz_id", quiz_id).execute()
        questions = questions_res.data
        
        for q in questions:
            options_res = supabase.table("options").select("id, text, is_correct").eq("question_id", q['id']).execute()
            q['options'] = options_res.data
            
        quiz['questions'] = questions
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/quizzes", response_model=QuizModel)
def create_quiz(quiz: QuizCreate, user=Depends(get_admin_user)):
    try:
        quiz_res = supabase.table("quizzes").insert({
            "title": quiz.title,
            "description": quiz.description,
            "time_limit_minutes": quiz.time_limit_minutes
        }).execute()
        
        created_quiz = quiz_res.data[0]
        quiz_id = created_quiz["id"]
        
        for q in quiz.questions:
            q_res = supabase.table("questions").insert({
                "quiz_id": quiz_id,
                "text": q.text
            }).execute()
            
            question_id = q_res.data[0]["id"]
            
            options_data = []
            for opt in q.options:
                options_data.append({
                    "question_id": question_id,
                    "text": opt.text,
                    "is_correct": opt.is_correct
                })
                
            if options_data:
                supabase.table("options").insert(options_data).execute()
                
        return get_admin_quiz_details(quiz_id, user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/quizzes/{quiz_id}", response_model=QuizModel)
def update_quiz(quiz_id: str, quiz: QuizCreate, user=Depends(get_admin_user)):
    try:
        supabase.table("quizzes").update({
            "title": quiz.title,
            "description": quiz.description,
            "time_limit_minutes": quiz.time_limit_minutes
        }).eq("id", quiz_id).execute()
        
        supabase.table("questions").delete().eq("quiz_id", quiz_id).execute()
        
        for q in quiz.questions:
            q_res = supabase.table("questions").insert({
                "quiz_id": quiz_id,
                "text": q.text
            }).execute()
            
            question_id = q_res.data[0]["id"]
            
            options_data = []
            for opt in q.options:
                options_data.append({
                    "question_id": question_id,
                    "text": opt.text,
                    "is_correct": opt.is_correct
                })
                
            if options_data:
                supabase.table("options").insert(options_data).execute()
                
        return get_admin_quiz_details(quiz_id, user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/quizzes/{quiz_id}")
def delete_quiz(quiz_id: str, user=Depends(get_admin_user)):
    try:
        supabase.table("quizzes").delete().eq("id", quiz_id).execute()
        return {"status": "success", "message": "Quiz deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
