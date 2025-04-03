const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * 1時間ごとに期限切れのアイデアをチェックして「消滅」状態に更新する
 */
exports.checkExpiredIdeas = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  
  try {
    // 現在時刻より前の期限を持つアイデアを検索
    const snapshot = await db.collection('ideas')
      .where('status', '==', '進行中')
      .where('deadline', '<', now)
      .get();
    
    if (snapshot.empty) {
      console.log('No expired ideas found');
      return null;
    }
    
    console.log(`Found ${snapshot.size} expired ideas`);
    
    // 期限切れアイデアごとに処理するバッチ
    const batch = db.batch();
    const deadIdeasPromises = [];
    
    // 各アイデアを処理
    snapshot.forEach(doc => {
      const ideaData = doc.data();
      
      // 1. アイデアを「消滅」状態に更新
      batch.update(doc.ref, {
        status: '消滅',
        updated_at: now
      });
      
      // 2. 墓場にアイデアを追加
      const tagsPromise = generateTags(ideaData);
      
      deadIdeasPromises.push(
        tagsPromise.then(tags => {
          const deadIdeaRef = db.collection('deadIdeas').doc();
          batch.set(deadIdeaRef, {
            original_idea_id: doc.id,
            original_user_id: ideaData.user_id,
            title: ideaData.title,
            last_step: ideaData.step,
            points: 30, // 引き継ぎポイント
            expired_at: now,
            tags: tags
          });
        })
      );
      
      // 3. ユーザーの統計情報を更新
      const userRef = db.collection('users').doc(ideaData.user_id);
      batch.update(userRef, {
        'stats.inProgress': admin.firestore.FieldValue.increment(-1),
        'stats.failed': admin.firestore.FieldValue.increment(1),
        updated_at: now
      });
    });
    
    // すべてのタグ生成が完了するのを待ってからバッチを実行
    await Promise.all(deadIdeasPromises);
    await batch.commit();
    
    console.log(`Successfully processed ${snapshot.size} expired ideas`);
    return null;
  } catch (error) {
    console.error('Error processing expired ideas:', error);
    return null;
  }
});

/**
 * アイデアデータからタグを生成する関数（簡易的な実装）
 * 実際のアプリケーションでは、より洗練されたタグ付けアルゴリズムを使用するとよい
 */
async function generateTags(ideaData) {
  // タイトルと説明文からキーワードを抽出
  const keywords = [];
  const title = ideaData.title || '';
  const description = ideaData.description || '';
  
  // タイトルからの抽出
  if (title.includes('AI') || title.includes('人工知能')) keywords.push('AI');
  if (title.includes('アプリ')) keywords.push('アプリ');
  if (title.includes('サービス')) keywords.push('サービス');
  
  // 説明文からの抽出
  if (description.includes('分析')) keywords.push('分析');
  if (description.includes('マッチング')) keywords.push('マッチング');
  if (description.includes('自動化')) keywords.push('自動化');
  if (description.includes('効率')) keywords.push('効率化');
  if (description.includes('AI') || description.includes('人工知能')) keywords.push('AI');
  
  // 重複を削除
  const uniqueKeywords = [...new Set(keywords)];
  
  // キーワードが不足している場合はデフォルトタグを追加
  const defaultTags = ['アイデア', 'テクノロジー', 'イノベーション'];
  for (const tag of defaultTags) {
    if (uniqueKeywords.length < 3 && !uniqueKeywords.includes(tag)) {
      uniqueKeywords.push(tag);
    }
  }
  
  // 最大3つのタグを返す
  return uniqueKeywords.slice(0, 3);
}