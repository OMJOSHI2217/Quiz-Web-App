import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Clock, BookOpen } from 'lucide-react';

import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000'; // Define backend URL

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [completedQuizIds, setCompletedQuizIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/quizzes`);
        setQuizzes(response.data);
        
        if (user) {
          const { data } = await supabase.from('results').select('quiz_id').eq('user_id', user.id);
          if (data) {
            setCompletedQuizIds(new Set(data.map(r => r.quiz_id)));
          }
        }
      } catch (err) {
        setError('Failed to load quizzes. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Available Quizzes</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-center">
            <p>{error}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-slate-100">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg">No quizzes available right now. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="h-2 bg-indigo-500 w-full group-hover:bg-indigo-600 transition-colors"></div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{quiz.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6 font-medium bg-slate-50 w-fit px-3 py-1.5 rounded-full">
                    <Clock size={16} className="mr-2 text-indigo-500" />
                    {quiz.time_limit_minutes} minutes
                  </div>
                  
                  {completedQuizIds.has(quiz.id) ? (
                    <button
                      disabled
                      className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-medium text-slate-500 bg-slate-200 cursor-not-allowed transition"
                    >
                      Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
