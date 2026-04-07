import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trophy, CheckCircle, XCircle, ArrowLeft, Target, AlertCircle } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultData = location.state?.result;
  const quizTitle = location.state?.quizTitle || 'Quiz Review';
  const quizData = location.state?.quizData;
  const userAnswers = location.state?.userAnswers || {};

  if (!resultData || !quizData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600">No results found. Please take a quiz first.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:underline">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { score, total_questions, correct_answers } = resultData;
  const wrongCount = total_questions - score;
  const percentage = Math.round((score / total_questions) * 100) || 0;

  // Find correct answer ID for a given question
  const getCorrectOptionId = (questionId) => {
    const match = correct_answers.find(ca => ca.question_id === questionId);
    return match ? match.correct_option_id : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        
        {/* Top Summary Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-indigo-600 px-6 py-8 text-center text-white">
            <Trophy size={56} className="mx-auto mb-3 text-yellow-300" />
            <h1 className="text-3xl font-extrabold mb-1">Results: {quizTitle}</h1>
            <p className="text-indigo-100 text-lg">You completed the quiz!</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              
              {/* Circular Score Dial */}
              <div className="relative flex-shrink-0">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={64 * 2 * Math.PI} 
                    strokeDashoffset={64 * 2 * Math.PI - (percentage / 100) * 64 * 2 * Math.PI}
                    className="text-indigo-600 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-3xl font-extrabold text-slate-800">{percentage}%</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center">
                  <Target className="text-indigo-500 mb-1" size={24} />
                  <span className="text-2xl font-bold text-slate-800">{total_questions}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Questions</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center">
                  <Trophy className="text-yellow-500 mb-1" size={24} />
                  <span className="text-2xl font-bold text-slate-800">{score}/{total_questions}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Final Score</span>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col items-center">
                  <CheckCircle className="text-green-500 mb-1" size={24} />
                  <span className="text-2xl font-bold text-green-700">{score}</span>
                  <span className="text-xs text-green-600 uppercase tracking-widest font-semibold">Correct</span>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col items-center">
                  <XCircle className="text-red-500 mb-1" size={24} />
                  <span className="text-2xl font-bold text-red-700">{wrongCount}</span>
                  <span className="text-xs text-red-600 uppercase tracking-widest font-semibold">Wrong</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Review Section */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <AlertCircle className="mr-2 text-indigo-600" />
          Detailed Review
        </h2>

        <div className="space-y-6">
          {quizData.questions && quizData.questions.map((q, index) => {
            const selectedOptionId = userAnswers[q.id];
            const correctOptionId = getCorrectOptionId(q.id);
            const isUnanswered = !selectedOptionId;
            const isCorrectlyAnswered = selectedOptionId === correctOptionId;

            return (
              <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <span className="text-slate-400 mr-2">Q{index + 1}.</span> 
                    {q.text}
                  </h3>
                  <div className="ml-4 shrink-0">
                    {isCorrectlyAnswered ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Correct
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        Missed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Wrong
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {q.options && q.options.map(opt => {
                    const isSelected = selectedOptionId === opt.id;
                    const isCorrect = correctOptionId === opt.id;
                    
                    let bgClass = "bg-white border-slate-200";
                    let textClass = "text-slate-700";
                    let icon = null;

                    if (isCorrect) {
                      bgClass = "bg-green-50 border-green-500 ring-1 ring-green-500";
                      textClass = "text-green-900 font-medium";
                      icon = <CheckCircle size={18} className="text-green-600 ml-auto shrink-0" />;
                    } else if (isSelected && !isCorrect) {
                      bgClass = "bg-red-50 border-red-300";
                      textClass = "text-red-900";
                      icon = <XCircle size={18} className="text-red-500 ml-auto shrink-0" />;
                    }

                    return (
                      <div 
                        key={opt.id} 
                        className={`flex items-center p-4 border rounded-lg transition-colors ${bgClass}`}
                      >
                        <span className={`block text-base w-full pr-4 ${textClass}`}>
                          {opt.text}
                        </span>
                        {icon}
                        {isSelected && isCorrect && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded ml-2 whitespace-nowrap">Your Answer</span>}
                        {isSelected && !isCorrect && <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded ml-2 whitespace-nowrap">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="mt-10 mb-20 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

      </main>
    </div>
  );
}
