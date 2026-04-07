from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class OptionModel(BaseModel):
    id: UUID
    text: str
    is_correct: Optional[bool] = None

class QuestionModel(BaseModel):
    id: UUID
    text: str
    options: List[OptionModel]

class QuizModel(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    time_limit_minutes: int
    questions: Optional[List[QuestionModel]] = []

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: str

class QuizSubmission(BaseModel):
    quiz_id: str
    user_id: str
    answers: List[AnswerSubmission]

class ResultResponse(BaseModel):
    score: int
    total_questions: int
    correct_answers: List[dict]

class OptionCreate(BaseModel):
    text: str
    is_correct: bool

class QuestionCreate(BaseModel):
    text: str
    options: List[OptionCreate]

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: int
    questions: List[QuestionCreate]
