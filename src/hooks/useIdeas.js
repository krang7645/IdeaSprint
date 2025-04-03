// src/hooks/useIdeas.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserIdeas, 
  getIdea, 
  createIdea, 
  submitIdeaStep,
  getDeadIdeas,
  inheritDeadIdea
} from '../services/db';

// アイデア管理用カスタムフック
const useIdeas = () => {
  const { currentUser, userProfile, reloadProfile } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [deadIdeasList, setDeadIdeasList] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ユーザーのアイデア一覧を取得
  const fetchUserIdeas = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedIdeas = await getUserIdeas(currentUser.uid);
      setIdeas(fetchedIdeas);
    } catch (err) {
      console.error("アイデア一覧取得エラー:", err);
      setError("アイデア一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // 特定のアイデアを取得
  const fetchIdea = useCallback(async (ideaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const idea = await getIdea(ideaId);
      setSelectedIdea(idea);
      return idea;
    } catch (err) {
      console.error("アイデア詳細取得エラー:", err);
      setError("アイデアの詳細取得に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 新しいアイデアを作成
  const addNewIdea = useCallback(async (ideaData) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newIdea = await createIdea(currentUser.uid, ideaData);
      setIdeas(prevIdeas => [...prevIdeas, newIdea]);
      
      // ユーザープロフィールをリロード（統計情報更新のため）
      await reloadProfile();
      
      return newIdea;
    } catch (err) {
      console.error("アイデア作成エラー:", err);
      setError("アイデアの作成に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, reloadProfile]);

  // アイデアのステップを提出
  const submitStep = useCallback(async (ideaId, stepContent) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitIdeaStep(ideaId, currentUser.uid, stepContent);
      
      // アイデア一覧を更新
      await fetchUserIdeas();
      
      // 選択中のアイデアを更新
      if (selectedIdea && selectedIdea.id === ideaId) {
        await fetchIdea(ideaId);
      }
      
      // ユーザープロフィールをリロード（ポイント・統計更新のため）
      await reloadProfile();
      
      return result;
    } catch (err) {
      console.error("ステップ提出エラー:", err);
      setError("ステップの提出に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchUserIdeas, fetchIdea, selectedIdea, reloadProfile]);

  // 墓場のアイデア一覧を取得
  const fetchDeadIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const deadIdeas = await getDeadIdeas();
      setDeadIdeasList(deadIdeas);
      return deadIdeas;
    } catch (err) {
      console.error("墓場アイデア取得エラー:", err);
      setError("消滅したアイデアの取得に失敗しました");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 墓場からアイデアを引き継ぐ
  const inheritIdea = useCallback(async (deadIdeaId) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await inheritDeadIdea(deadIdeaId, currentUser.uid);
      
      // アイデア一覧を更新
      await fetchUserIdeas();
      
      // 墓場一覧を更新
      await fetchDeadIdeas();
      
      // ユーザープロフィールをリロード（ポイント・統計更新のため）
      await reloadProfile();
      
      return result;
    } catch (err) {
      console.error("アイデア引き継ぎエラー:", err);
      setError("アイデアの引き継ぎに失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchUserIdeas, fetchDeadIdeas, reloadProfile]);

  // ユーザーがログインしている場合、初回マウント時にアイデア一覧を取得
  useEffect(() => {
    if (currentUser) {
      fetchUserIdeas();
    } else {
      setIdeas([]);
      setSelectedIdea(null);
    }
  }, [currentUser, fetchUserIdeas]);

  // 残り時間を計算する関数
  const calculateTimeLeft = (deadline) => {
    if (!deadline) return null;
    
    const diff = deadline - new Date();
    if (diff <= 0) return "期限切れ";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}時間${minutes}分`;
  };

  // ステータスに応じた色クラスを取得
  const getStatusColor = (status) => {
    switch (status) {
      case "未着手": return "bg-gray-200 text-gray-800";
      case "進行中": return "bg-blue-200 text-blue-800";
      case "成功": return "bg-green-200 text-green-800";
      case "消滅": return "bg-red-200 text-red-800";
      default: return "bg-gray-200";
    }
  };

  // エラーをクリア
  const clearError = () => {
    setError(null);
  };

  return {
    ideas,
    deadIdeasList,
    selectedIdea,
    loading,
    error,
    fetchUserIdeas,
    fetchIdea,
    addNewIdea,
    submitStep,
    fetchDeadIdeas,
    inheritIdea,
    calculateTimeLeft,
    getStatusColor,
    clearError,
    setSelectedIdea
  };
};

export default useIdeas;