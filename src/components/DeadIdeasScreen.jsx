// src/components/DeadIdeasScreen.jsx
import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import useIdeas from '../hooks/useIdeas';

const DeadIdeasScreen = ({ navigateTo }) => {
  const { 
    deadIdeasList, 
    loading, 
    error, 
    fetchDeadIdeas,
    inheritIdea
  } = useIdeas();
  
  const [inheriting, setInheriting] = useState(false);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  
  // コンポーネントマウント時にアイデア一覧を取得
  useEffect(() => {
    fetchDeadIdeas();
  }, [fetchDeadIdeas]);
  
  // アイデアを引き継ぐ処理
  const handleInheritIdea = async (deadIdeaId) => {
    setInheriting(true);
    setCurrentIdeaId(deadIdeaId);
    
    try {
      const result = await inheritIdea(deadIdeaId);
      if (result?.success) {
        alert(`アイデアを引き継ぎました。${result.points}ポイント獲得しました！`);
        navigateTo('home');
      }
    } catch (err) {
      console.error("引き継ぎエラー:", err);
    } finally {
      setInheriting(false);
      setCurrentIdeaId(null);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">アイデアの墓場</h1>
      <p className="text-gray-600 mb-4">時間切れで消滅したアイデアを引き継いで、新たな命を吹き込みましょう。</p>
      
      {/* エラー表示 */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ローディング表示 */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* データがない場合 */}
      {!loading && deadIdeasList.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-2">墓場にはまだアイデアがありません</h2>
          <p className="text-gray-500 mb-4">消滅したアイデアがここに表示されます。</p>
          <button
            onClick={() => navigateTo('home')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            ダッシュボードに戻る
          </button>
        </div>
      )}
      
      {/* 墓場のアイデア一覧 */}
      {!loading && deadIdeasList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deadIdeasList.map(idea => (
            <div key={idea.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <h2 className="font-bold text-lg mb-2">{idea.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                最終ステップ: {idea.last_step}/4
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {idea.tags && idea.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm flex items-center">
                  <Gift size={16} className="mr-1" />
                  引き継ぎ: {idea.points}pt
                </span>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm rounded-lg"
                  onClick={() => handleInheritIdea(idea.id)}
                  disabled={inheriting}
                >
                  {inheriting && currentIdeaId === idea.id ? '引き継ぎ中...' : '引き継ぐ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeadIdeasScreen;