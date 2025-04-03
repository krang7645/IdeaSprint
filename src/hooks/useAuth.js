// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithGoogle, 
  signInWithGithub, 
  logoutUser, 
  onAuthStateChange,
  getUserProfile
} from '../services/auth';

// 認証コンテキスト
const AuthContext = createContext(null);

// AuthProviderコンポーネント
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // FirebaseのAuth状態変更を監視
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      
      try {
        if (user) {
          // ユーザーがログインしている場合、プロフィール情報を取得
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("プロフィール取得エラー:", err);
        setError("ユーザー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });

    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe();
  }, []);

  // 認証プロバイダーでログイン
  const login = async (provider) => {
    setError(null);
    setLoading(true);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      } else {
        throw new Error("不明な認証プロバイダー");
      }
    } catch (err) {
      console.error("ログインエラー:", err);
      setError("ログインに失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  