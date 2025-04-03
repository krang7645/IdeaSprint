// src/services/auth.js
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();

// GitHub認証プロバイダー
const githubProvider = new GithubAuthProvider();

// Google認証でログイン
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // ユーザー情報をFirestoreに保存/更新
    await saveUserToFirestore(result.user, 'google');
    return result.user;
  } catch (error) {
    console.error("Google認証エラー:", error);
    throw error;
  }
};

// GitHub認証でログイン
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    // ユーザー情報をFirestoreに保存/更新
    await saveUserToFirestore(result.user, 'github');
    return result.user;
  } catch (error) {
    console.error("GitHub認証エラー:", error);
    throw error;
  }
};

// ログアウト
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("ログアウトエラー:", error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ユーザー情報をFirestoreに保存
const saveUserToFirestore = async (user, provider) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // ユーザーが既に存在するか確認
  if (userSnap.exists()) {
    // 最終ログイン日時のみ更新
    await setDoc(userRef, {
      last_login_at: serverTimestamp()
    }, { merge: true });
  } else {
    // 新規ユーザーの場合、初期データを作成
    await setDoc(userRef, {
      user_id: user.uid,
      provider_id: user.providerData[0]?.uid || '',
      provider_type: provider,
      display_name: user.displayName || '名称未設定',
      avatar_url: user.photoURL || '',
      email: user.email || '',
      points: 0,
      level: 1,
      rank: "アイデアビギナー",
      stats: {
        success: 0,
        failed: 0,
        inProgress: 0
      },
      created_at: serverTimestamp(),
      last_login_at: serverTimestamp()
    });
  }
};

// 現在のユーザー情報を取得
export const getCurrentUser = () => {
  return auth.currentUser;
};

// ユーザープロフィールデータを取得
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log("ユーザープロフィールが見つかりません");
      return null;
    }
  } catch (error) {
    console.error("プロフィール取得エラー:", error);
    throw error;
  }
};
