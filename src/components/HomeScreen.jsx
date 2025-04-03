// src/components/HomeScreen.jsx
import React, { useEffect } from 'react';
import { Clock, PlusCircle } from 'lucide-react';
import useIdeas from '../hooks/useIdeas';

const HomeScreen = ({ navigateTo, userProfile }) => {
  const { 
    ideas, 
    loading, 
    error, 
    fetchUserIdeas, 
    calculateTimeLeft, 
    getStatusColor 
  } = useIdeas();
  
  // コンポーネントマウント時にアイデア一覧を取得
  useEffect(() => {
    fetchUserIdeas();
  }, [fetchUserIdeas]);
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">アイデアダッシュボード</h1>
          <p className="text-gray-600">あなたのアイデアを形にしましょう</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">ポイント</p>
            <p className="font-bold text-lg">{userProfile?.points || 0} pt</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">バッジ</p>
            <p className="font-bold text-lg">{userProfile?.badges?.length || 0}</p>
          </div>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => navigateTo('newIdea')}
          >
            <PlusCircle size={16} className="mr-2" />
            新しいアイデア
          </button>
        </div>
      </div>
      
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
      
      {/* アイデアがない場合 */}
      {!loading && ideas.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-2">まだアイデアがありません</h2>
          <p className="text-gray-500 mb-4">新しいアイデアを追加するか、墓場からアイデアを引き継いでみましょう。</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigateTo('newIdea')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusCircle size={16} className="mr-2" />
              新しいアイデア
            </button>
            <button
              onClick={() => navigateTo('deadIdeas')}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg"
            >
              墓場を見る
            </button>
          </div>
        </div>
      )}
      
      {/* アイデア一覧 */}
      {!loading && ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map(idea => (
            <div 
              key={idea.id} 
              className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => navigateTo('ideaDetail', idea.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-bold text-lg">{idea.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(idea.status)}`}>
                  {idea.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full" 
                    style={{ width: `${(idea.step / 4) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  ステップ {idea.step}/4: 
                  {idea.step === 1 && "概要記述"}
                  {idea.step === 2 && "調査提出"}
                  {idea.step === 3 && "プロトタイプ提出"}
                  {idea.step === 4 && "リリース報告"}
                </div>
                
                {idea.deadline && idea.status !== "成功" && idea.status !== "消滅" && (
                  <div className="flex items-center text-sm">
                    <Clock size={16} className="mr-1 text-red-500" />
                    <span className={`${calculateTimeLeft(idea.deadline).includes("時間") && parseInt(calculateTimeLeft(idea.deadline)) < 3 ? "text-red-500 font-bold" : "text-gray-600"}`}>
                      残り {calculateTimeLeft(idea.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeScreen;