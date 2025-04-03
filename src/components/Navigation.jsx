// src/components/Navigation.jsx
import React from 'react';
import { BarChart2, Home, PlusCircle, Trash2, User } from 'lucide-react';

const Navigation = ({ currentScreen, navigateTo }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
      <div className="flex justify-around max-w-2xl mx-auto">
        <button 
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center p-2 ${currentScreen === 'home' ? 'text-indigo-600' : 'text-gray-600'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">ホーム</span>
        </button>
        <button 
          onClick={() => navigateTo('deadIdeas')}
          className={`flex flex-col items-center p-2 ${currentScreen === 'deadIdeas' ? 'text-indigo-600' : 'text-gray-600'}`}
        >
          <Trash2 size={20} />
          <span className="text-xs mt-1">墓場</span>
        </button>
        <button 
          onClick={() => navigateTo('newIdea')}
          className="flex flex-col items-center p-2 bg-indigo-600 text-white rounded-full -mt-5 shadow-lg"
        >
          <PlusCircle size={24} />
          <span className="text-xs mt-1">新規</span>
        </button>
        <button 
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-gray-600"
        >
          <BarChart2 size={20} />
          <span className="text-xs mt-1">ランキング</span>
        </button>
        <button 
          onClick={() => navigateTo('profile')}
          className={`flex flex-col items-center p-2 ${currentScreen === 'profile' ? 'text-indigo-600' : 'text-gray-600'}`}
        >
          <User size={20} />
          <span className="text-xs mt-1">プロフィール</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;