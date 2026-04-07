import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:8000';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (user) {
          const { data } = await supabase.from('results').select('id').eq('user_id', user.id).eq('quiz_id', id);
          if (data && data.length > 0) {
            setError('You have already completed this quiz.');
            setLoading(false);
            return;
          }
        }
        
        const response = await axios.get(`${API_URL}/api/quizzes/${id}`);
        setQuiz(response.data);
        setTimeLeft(response.data.time_limit_minutes * 60);
      } catch (err) {
        setError('Quiz not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, user]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quiz && !isSubmitting) {
      handleSubmit(); // Auto-submit when time is up
    }
  }, [timeLeft, isSubmitting, quiz]);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
      question_id: qId,
      selected_option_id: optId,
    }));

    try {
      const response = await axios.post(`${API_URL}/api/quizzes/submit`, {
        quiz_id: id,
        user_id: user.id,
        answers: formattedAnswers,
      });
      
      // Navigate to results page with detailed data
      navigate('/result', { 
        state: { 
          result: response.data, 
          quizTitle: quiz.title,
          quizData: quiz,
          userAnswers: answers
        } 
      });
    } catch (err) {
      // Extensive detailed logging for debugging
      console.error("Full Submission Error Object:", err);
      const backendError = err.response?.data?.detail || err.message;
      console.error("Backend Error Detail:", backendError);
      
      setError(`Failed to submit quiz: ${backendError}`);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 w-full py-12 flex justify-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg flex flex-col items-center">
          <AlertTriangle size={32} className="mb-2" />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Sticky Top Bar for Timer */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 truncate">{quiz.title}</h2>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg 
            ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        {quiz.description && (
          <p className="text-gray-600 mb-8 bg-white p-4 rounded-lg border border-slate-200">{quiz.description}</p>
        )}

        <div className="space-y-8">
          {quiz.questions && quiz.questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span className="text-indigo-600 mr-2">Q{index + 1}.</span> 
                {q.text}
              </h3>
              
              <div className="space-y-3">
                {q.options && q.options.map(opt => (
                  <label 
                    key={opt.id} 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                      ${answers[q.id] === opt.id 
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={answers[q.id] === opt.id}
                      onChange={() => handleOptionSelect(q.id, opt.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700 block text-base w-full">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 mb-20 flex justify-end border-t pt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </main>
    </div>
  );
}
