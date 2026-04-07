import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpenCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-indigo-600 font-bold text-xl gap-2">
              <BookOpenCheck size={28} />
              Quizzy
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.profile?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Admin Panel
                  </Link>
                )}
                <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
