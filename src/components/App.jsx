// src/components/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from './LoginScreen';
import Navigation from './Navigation';
import HomeScreen from './HomeScreen';
import IdeaDetailScreen from './IdeaDetailScreen';
import NewIdeaScreen from './NewIdeaScreen';
import DeadIdeasScreen from './DeadIdeasScreen';
import ProfileScreen from './ProfileScreen';

const App = () => {
  // 認証情報を取得
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  
  // 現在の画面を管理するステート
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  
  // 認証状態が変わった時に画面をリセット
  useEffect(() => {
    if (!currentUser) {
      setCurrentScreen('login');
      setSelectedIdeaId(null);
    } else {
      setCurrentScreen('home');
    }
  }, [currentUser]);
  
  // 画面切り替え関数
  const navigateTo = (screen, ideaId = null) => {
    setCurrentScreen(screen);
    if (ideaId) setSelectedIdeaId(ideaId);
  };
  
  // 認証ローディング中は簡易なローディング表示
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // 未ログインならログイン画面を表示
  if (!currentUser) {
    return <LoginScreen />;
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {currentScreen === 'home' && (
        <HomeScreen 
          navigateTo={navigateTo} 
          userProfile={userProfile}
        />
      )}
      
      {currentScreen === 'ideaDetail' && (
        <IdeaDetailScreen 
          navigateTo={navigateTo} 
          ideaId={selectedIdeaId}
        />
      )}
      
      {currentScreen === 'newIdea' && (
        <NewIdeaScreen 
          navigateTo={navigateTo}
        />
      )}
      
      {currentScreen === 'deadIdeas' && (
        <DeadIdeasScreen 
          navigateTo={navigateTo}
        />
      )}
      
      {currentScreen === 'profile' && (
        <ProfileScreen 
          navigateTo={navigateTo} 
          userProfile={userProfile}
        />
      )}
      
      <Navigation 
        currentScreen={currentScreen} 
        navigateTo={navigateTo} 
      />
    </div>
  );
};

export default App;