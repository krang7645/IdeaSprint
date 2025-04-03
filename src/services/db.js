// src/services/db.js
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ========== アイデア関連の操作 ==========

// ユーザーのアイデア一覧を取得
export const getUserIdeas = async (userId) => {
  try {
    const q = query(collection(db, 'ideas'), where("user_id", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const ideas = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Timestampをdateオブジェクトに変換
      const deadline = data.deadline ? data.deadline.toDate() : null;
      
      ideas.push({
        id: doc.id,
        ...data,
        deadline: deadline
      });
    });
    
    return ideas;
  } catch (error) {
    console.error("アイデア取得エラー:", error);
    throw error;
  }
};

// 特定のアイデアを取得
export const getIdea = async (ideaId) => {
  try {
    const ideaRef = doc(db, 'ideas', ideaId);
    const ideaSnap = await getDoc(ideaRef);
    
    if (ideaSnap.exists()) {
      const data = ideaSnap.data();
      // Timestampをdateオブジェクトに変換
      const deadline = data.deadline ? data.deadline.toDate() : null;
      
      return {
        id: ideaSnap.id,
        ...data,
        deadline: deadline
      };
    } else {
      console.log("アイデアが見つかりません");
      return null;
    }
  } catch (error) {
    console.error("アイデア詳細取得エラー:", error);
    throw error;
  }
};

// 新しいアイデアを作成
export const createIdea = async (userId, ideaData) => {
  try {
    // 期限を24時間後に設定
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);
    
    // タイムスタンプを作成
    const now = new Date();
    const timestampStr = now.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '/');
    
    const newIdea = {
      user_id: userId,
      title: ideaData.title,
      description: ideaData.description,
      status: "進行中",
      step: 1,
      deadline: Timestamp.fromDate(deadline),
      research: "",
      prototype: "",
      release: "",
      timestamp: [
        { step: 1, date: timestampStr }
      ],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'ideas'), newIdea);
    
    // ユーザーの進行中アイデア数を更新
    await updateUserStats(userId, 'inProgress', 1);
    
    return {
      id: docRef.id,
      ...newIdea,
      deadline: deadline
    };
  } catch (error) {
    console.error("アイデア作成エラー:", error);
    throw error;
  }
};

// アイデアの次のステップを提出
export const submitIdeaStep = async (ideaId, userId, stepContent) => {
  try {
    // アイデア情報を取得
    const ideaRef = doc(db, 'ideas', ideaId);
    const ideaSnap = await getDoc(ideaRef);
    
    if (!ideaSnap.exists()) {
      throw new Error("アイデアが見つかりません");
    }
    
    const ideaData = ideaSnap.data();
    
    // ユーザーIDが一致するか確認
    if (ideaData.user_id !== userId) {
      throw new Error("このアイデアを編集する権限がありません");
    }
    
    // 現在のステップを確認
    const currentStep = ideaData.step;
    const nextStep = currentStep + 1;
    
    if (nextStep > 4) {
      throw new Error("すでに最終ステップに到達しています");
    }
    
    // 次の期限を設定（24時間後）
    const nextDeadline = new Date();
    nextDeadline.setHours(nextDeadline.getHours() + 24);
    
    // タイムスタンプを作成
    const now = new Date();
    const timestampStr = now.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '/');
    
    // 更新データを準備
    const updateData = {
      step: nextStep,
      deadline: nextStep < 4 ? Timestamp.fromDate(nextDeadline) : null,
      updated_at: serverTimestamp(),
      timestamp: [...ideaData.timestamp, { step: nextStep, date: timestampStr }]
    };
    
    // ステップごとに異なるフィールドを更新
    if (currentStep === 1) {
      updateData.research = stepContent;
    } else if (currentStep === 2) {
      updateData.prototype = stepContent;
    } else if (currentStep === 3) {
      updateData.release = stepContent;
      updateData.status = "成功";
      
      // 成功ステータスに変更したので統計を更新
      await updateUserStats(userId, 'inProgress', -1);
      await updateUserStats(userId, 'success', 1);
      
      // ポイントを付与
      await addUserPoints(userId, 50);
    }
    
    // データを更新
    await updateDoc(ideaRef, updateData);
    
    return {
      success: true,
      nextStep,
      nextDeadline: nextStep < 4 ? nextDeadline : null
    };
  } catch (error) {
    console.error("ステップ提出エラー:", error);
    throw error;
  }
};

// 期限切れアイデアを処理（バックグラウンドで実行）
export const processExpiredIdeas = async () => {
  try {
    // 現在時刻より前の期限を持つアイデアを検索
    const now = new Date();
    const q = query(
      collection(db, 'ideas'),
      where("status", "==", "進行中"),
      where("deadline", "<", Timestamp.fromDate(now))
    );
    
    const querySnapshot = await getDocs(q);
    
    // 期限切れアイデアごとに処理
    const batch = [];
    querySnapshot.forEach((document) => {
      const ideaData = document.data();
      
      // 期限切れアイデアを「消滅」状態に更新
      batch.push(updateDoc(doc(db, 'ideas', document.id), {
        status: "消滅",
        updated_at: serverTimestamp()
      }));
      
      // 墓場（deadIdeas）コレクションに追加
      const deadIdeaData = {
        original_idea_id: document.id,
        original_user_id: ideaData.user_id,
        title: ideaData.title,
        last_step: ideaData.step,
        points: 30, // 引き継ぎポイント
        expired_at: serverTimestamp(),
        tags: generateTags(ideaData)
      };
      
      batch.push(addDoc(collection(db, 'deadIdeas'), deadIdeaData));
      
      // ユーザーの統計情報を更新
      batch.push(updateUserStats(ideaData.user_id, 'inProgress', -1));
      batch.push(updateUserStats(ideaData.user_id, 'failed', 1));
    });
    
    // バッチ処理を実行
    await Promise.all(batch);
    
    return {
      processed: querySnapshot.size
    };
  } catch (error) {
    console.error("期限切れ処理エラー:", error);
    throw error;
  }
};

// タグを生成（簡易実装）
const generateTags = (ideaData) => {
  const tags = [];
  
  // タイトルから抽出
  const title = ideaData.title;
  if (title.includes('AI')) tags.push('AI');
  if (title.includes('アプリ')) tags.push('アプリ');
  if (title.includes('サービス')) tags.push('サービス');
  
  // 説明文から抽出
  const description = ideaData.description;
  if (description.includes('分析')) tags.push('分析');
  if (description.includes('マッチング')) tags.push('マッチング');
  if (description.includes('自動化')) tags.push('自動化');
  
  // タグ数が足りない場合
  if (tags.length < 3) {
    const defaultTags = ['テクノロジー', 'アイデア', 'イノベーション'];
    for (const tag of defaultTags) {
      if (tags.length < 3 && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  
  return tags.slice(0, 3); // 最大3つのタグを返す
};

// ========== 墓場（DeadIdeas）関連の操作 ==========

// 墓場のアイデア一覧を取得
export const getDeadIdeas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'deadIdeas'));
    
    const deadIdeas = [];
    querySnapshot.forEach((doc) => {
      deadIdeas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return deadIdeas;
  } catch (error) {
    console.error("墓場アイデア取得エラー:", error);
    throw error;
  }
};

// 墓場からアイデアを引き継ぐ
export const inheritDeadIdea = async (deadIdeaId, userId) => {
  try {
    // 墓場のアイデア情報を取得
    const deadIdeaRef = doc(db, 'deadIdeas', deadIdeaId);
    const deadIdeaSnap = await getDoc(deadIdeaRef);
    
    if (!deadIdeaSnap.exists()) {
      throw new Error("このアイデアは既に引き継がれています");
    }
    
    const deadIdeaData = deadIdeaSnap.data();
    
    // 新しいアイデアを作成
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);
    
    const timestampStr = new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '/');
    
    // 元のアイデアを取得（あれば）
    let originalDescription = "";
    let originalResearch = "";
    
    const originalIdeaRef = doc(db, 'ideas', deadIdeaData.original_idea_id);
    const originalIdeaSnap = await getDoc(originalIdeaRef);
    
    if (originalIdeaSnap.exists()) {
      const originalData = originalIdeaSnap.data();
      originalDescription = originalData.description || "";
      originalResearch = originalData.research || "";
    }
    
    // 新しいアイデアを作成
    const newIdea = {
      user_id: userId,
      title: deadIdeaData.title,
      description: originalDescription,
      status: "進行中",
      step: 1, // 最初のステップから再開
      deadline: Timestamp.fromDate(deadline),
      research: deadIdeaData.last_step >= 2 ? originalResearch : "",
      prototype: "",
      release: "",
      inherited_from: deadIdeaId,
      timestamp: [
        { step: 1, date: timestampStr }
      ],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const newIdeaRef = await addDoc(collection(db, 'ideas'), newIdea);
    
    // 墓場からアイデアを削除
    await deleteDoc(deadIdeaRef);
    
    // ポイントを付与
    await addUserPoints(userId, deadIdeaData.points);
    
    // ユーザーの進行中アイデア数を更新
    await updateUserStats(userId, 'inProgress', 1);
    
    return {
      success: true,
      ideaId: newIdeaRef.id,
      points: deadIdeaData.points
    };
  } catch (error) {
    console.error("アイデア引き継ぎエラー:", error);
    throw error;
  }
};

// ========== ユーザー関連の操作 ==========

// ユーザー統計情報を更新
export const updateUserStats = async (userId, statKey, change) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("ユーザーが見つかりません");
    }
    
    const userData = userSnap.data();
    const currentStats = userData.stats || { success: 0, failed: 0, inProgress: 0 };
    
    currentStats[statKey] = Math.max(0, (currentStats[statKey] || 0) + change);
    
    await updateDoc(userRef, {
      stats: currentStats,
      updated_at: serverTimestamp()
    });
    
    return currentStats;
  } catch (error) {
    console.error("統計更新エラー:", error);
    throw error;
  }
};

// ユーザーにポイントを追加
export const addUserPoints = async (userId, points) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("ユーザーが見つかりません");
    }
    
    const userData = userSnap.data();
    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + points;
    
    // レベル計算（簡易実装）
    const currentLevel = userData.level || 1;
    const pointsPerLevel = 100;
    const newLevel = Math.floor(newPoints / pointsPerLevel) + 1;
    
    // ランクの更新
    let newRank = userData.rank || "アイデアビギナー";
    if (newLevel >= 10) newRank = "アイデアマスター";
    else if (newLevel >= 7) newRank = "アイデアエキスパート";
    else if (newLevel >= 5) newRank = "アイデアスプリンター";
    else if (newLevel >= 3) newRank = "アイデアチャレンジャー";
    
    // バッジのチェック（成功回数に応じたバッジなど）
    const badges = await checkAndUpdateBadges(userId, userData);
    
    const updateData = {
      points: newPoints,
      updated_at: serverTimestamp()
    };
    
    // レベルアップした場合
    if (newLevel > currentLevel) {
      updateData.level = newLevel;
      updateData.rank = newRank;
    }
    
    await updateDoc(userRef, updateData);
    
    return {
      oldPoints: currentPoints,
      newPoints,
      pointsAdded: points,
      levelUp: newLevel > currentLevel,
      newLevel: newLevel > currentLevel ? newLevel : currentLevel,
      newBadges: badges.newBadges
    };
  } catch (error) {
    console.error("ポイント追加エラー:", error);
    throw error;
  }
};

// バッジをチェックして更新
export const checkAndUpdateBadges = async (userId, userData) => {
  try {
    // ユーザーデータが渡されなかった場合、取得
    if (!userData) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("ユーザーが見つかりません");
      }
      
      userData = userSnap.data();
    }
    
    // 現在のバッジリスト
    const currentBadges = userData.badges || [];
    const currentBadgeNames = currentBadges.map(badge => badge.name);
    
    const newBadges = [];
    
    // 成功アイデアのバッジをチェック
    if (userData.stats?.success >= 1 && !currentBadgeNames.includes("初めての成功")) {
      newBadges.push({
        name: "初めての成功",
        icon: "Award",
        earned_at: new Date().toISOString()
      });
    }
    
    if (userData.stats?.success >= 5 && !currentBadgeNames.includes("アイデアクリエーター")) {
      newBadges.push({
        name: "アイデアクリエーター",
        icon: "Star",
        earned_at: new Date().toISOString()
      });
    }
    
    // ポイントに関するバッジ
    if (userData.points >= 100 && !currentBadgeNames.includes("ポイントハンター")) {
      newBadges.push({
        name: "ポイントハンター",
        icon: "Target",
        earned_at: new Date().toISOString()
      });
    }
    
    // 新しいバッジがある場合、更新
    if (newBadges.length > 0) {
      const updatedBadges = [...currentBadges, ...newBadges];
      
      await updateDoc(doc(db, 'users', userId), {
        badges: updatedBadges,
        updated_at: serverTimestamp()
      });
    }
    
    return {
      newBadges,
      allBadges: [...currentBadges, ...newBadges]
    };
  } catch (error) {
    console.error("バッジ更新エラー:", error);
    throw error;
  }
};
