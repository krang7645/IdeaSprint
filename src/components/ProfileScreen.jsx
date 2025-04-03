// src/components/ProfileScreen.jsx
import React from 'react';
import { Award, Clock, Star, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen = ({ navigateTo }) => {
  const { userProfile, logout } = useAuth();
  
  // バッジのアイコンを取得する関数
  const getBadgeIcon = (iconName, size = 16) => {
    switch (iconName) {
      case 'Award':
        return <Award size={size} />;
      case 'Clock':
        return <Clock size={size} />;
      case 'Star':
        return <Star size={size} />;
      case 'ThumbsUp':
        return <ThumbsUp size={size} />;
      default:
        return <Award size={size} />;
    }
  };
  
  if (!userProfile) {
    return (
      <div className="p-4 flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">マイプロフィール</h1>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
            {userProfile.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt={userProfile.display_name} 
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userProfile.display_name}</h2>
            <div className="flex items-center text-gray-600">
              <Star size={16} className="mr-1 text-yellow-500" />
              <span>Lv.{userProfile.level} {userProfile.rank}</span>
            </div>
          </div>
          <div className="ml-auto text-center">
            <p className="text-gray-600">ポイント</p>
            <p className="font-bold text-2xl">{userProfile.points}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">成功</p>
            <p className="font-bold text-xl text-green-600">{userProfile.stats?.success || 0}</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">失敗</p>
            <p className="font-bold text-xl text-red-600">{userProfile.stats?.failed || 0}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">進行中</p>
            <p className="font-bold text-xl text-blue-600">{userProfile.stats?.inProgress || 0}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-3">獲得バッジ</h3>
          {userProfile.badges && userProfile.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfile.badges.map((badge, index) => (
                <div key={index} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg flex items-center">
                  <span className="mr-2">{getBadgeIcon(badge.icon)}</span>
                  {badge.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">まだバッジを獲得していません。アイデアを完成させてバッジをゲットしましょう！</p>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button 
            onClick={logout}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ログアウト
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-bold mb-4">アイデア派生ツリー</h3>
        <div className="bg-gray-100 p-8 rounded-lg flex justify-center">
          <p className="text-gray-500">アイデアの関連ツリーが表示されます（開発中）</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;