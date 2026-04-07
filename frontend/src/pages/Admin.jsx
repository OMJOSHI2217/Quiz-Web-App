import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, Plus, Save, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Admin() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'edit', 'create'
  const [currentQuiz, setCurrentQuiz] = useState({ title: '', description: '', time_limit_minutes: 10, questions: [] });
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get JWT session token
    import('../supabaseClient').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        setToken(data.session?.access_token);
        fetchQuizzes();
      });
    });
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuizzes();
    } catch (err) {
      alert("Failed to delete quiz: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentQuiz(res.data);
      setView('edit');
    } catch (err) {
      alert("Failed to fetch quiz details.");
    }
  };

  const handleSave = async () => {
    try {
      const url = view === 'edit' ? `http://localhost:8000/api/admin/quizzes/${currentQuiz.id}` : 'http://localhost:8000/api/admin/quizzes';
      const method = view === 'edit' ? 'put' : 'post';
      
      await axios[method](url, currentQuiz, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setView('list');
      fetchQuizzes();
    } catch (err) {
      alert("Failed to save quiz: " + (err.response?.data?.detail || err.message));
    }
  };

  const addQuestion = () => {
    setCurrentQuiz({
      ...currentQuiz,
      questions: [...currentQuiz.questions, { text: '', options: [] }]
    });
  };

  const addOption = (qIdx) => {
    const newQuestions = [...currentQuiz.questions];
    newQuestions[qIdx].options.push({ text: '', is_correct: false });
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  const updateQuestion = (qIdx, text) => {
    const newQuestions = [...currentQuiz.questions];
    newQuestions[qIdx].text = text;
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  const removeQuestion = (qIdx) => {
    const newQuestions = [...currentQuiz.questions];
    newQuestions.splice(qIdx, 1);
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    const newQuestions = [...currentQuiz.questions];
    // If setting a correct option, uncheck others.
    if (field === 'is_correct' && value === true) {
      newQuestions[qIdx].options.forEach(opt => opt.is_correct = false);
    }
    newQuestions[qIdx].options[oIdx][field] = value;
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  const removeOption = (qIdx, oIdx) => {
    const newQuestions = [...currentQuiz.questions];
    newQuestions[qIdx].options.splice(oIdx, 1);
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  if (!user || user?.profile?.role !== 'admin') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center text-red-600 font-medium">
          Access Denied. You do not have admin privileges.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {view === 'list' && (
            <button
              onClick={() => { setCurrentQuiz({ title: '', description: '', time_limit_minutes: 10, questions: [] }); setView('create'); }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus size={20} /> Create Quiz
            </button>
          )}
          {view !== 'list' && (
            <button
              onClick={() => setView('list')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft size={20} /> Back to List
            </button>
          )}
        </div>

        {view === 'list' ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? <p className="p-4">Loading quizzes...</p> : (
              <ul className="divide-y divide-gray-200">
                {quizzes.length === 0 && <li className="p-4 text-gray-500">No quizzes found.</li>}
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.questions?.length || 0} questions • {quiz.time_limit_minutes} mins</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => handleEditClick(quiz.id)} className="text-blue-600 hover:text-blue-800 p-2">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => deleteQuiz(quiz.id)} className="text-red-600 hover:text-red-800 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">{view === 'create' ? 'Create New Quiz' : 'Edit Quiz'}</h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
                  value={currentQuiz.title} onChange={e => setCurrentQuiz({...currentQuiz, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
                  value={currentQuiz.description || ''} onChange={e => setCurrentQuiz({...currentQuiz, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (mins)</label>
                <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
                  value={currentQuiz.time_limit_minutes} onChange={e => setCurrentQuiz({...currentQuiz, time_limit_minutes: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4 flex items-center justify-between">
                Questions
                <button onClick={addQuestion} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm flex items-center gap-1 border border-indigo-600">
                  <Plus size={16} /> Add Question
                </button>
              </h3>
              
              <div className="space-y-8">
                {currentQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="border border-gray-200 rounded-md p-4 bg-gray-50 relative">
                    <button onClick={() => removeQuestion(qIdx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question {qIdx + 1}</label>
                    <input type="text" className="w-full mb-4 border-gray-300 rounded-md shadow-sm p-2 border pr-10" 
                      value={q.text} onChange={e => updateQuestion(qIdx, e.target.value)} placeholder="Question text..." />
                    
                    <div className="pl-4 border-l-2 border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        <button onClick={() => addOption(qIdx)} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                      
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => updateOption(qIdx, oIdx, 'is_correct', true)}
                            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors shrink-0 flex items-center justify-center w-28 ${
                              opt.is_correct 
                                ? 'bg-green-100 text-green-700 border border-green-300 shadow-inner' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                            }`}
                          >
                            {opt.is_correct ? '✓ Correct' : 'Mark Correct'}
                          </button>
                          <input type="text" className={`flex-1 border rounded-md p-1.5 text-sm ${opt.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-300'}`} 
                            value={opt.text} onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)} placeholder="Option text..." />
                          <button onClick={() => removeOption(qIdx, oIdx)} className="text-gray-400 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {q.options.length === 0 && <p className="text-xs text-gray-500">No options added yet.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2">
                <Save size={20} /> Save Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
