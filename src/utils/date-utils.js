// src/utils/dateUtils.js

/**
 * 日付を「YYYY/MM/DD HH:mm」形式でフォーマットする
 * 
 * @param {Date} date - フォーマットする日付
 * @returns {string} フォーマットされた日付文字列
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '/');
};

/**
 * 残り時間を計算する
 * 
 * @param {Date} deadline - 期限の日付
 * @returns {string|null} 「○時間○分」形式の残り時間、または null（期限なし）、「期限切れ」（期限超過）
 */
export const calculateTimeLeft = (deadline) => {
  if (!deadline) return null;
  
  const diff = deadline - new Date();
  if (diff <= 0) return "期限切れ";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}時間${minutes}分`;
};

/**
 * 残り時間をミリ秒で取得
 * 
 * @param {Date} deadline - 期限の日付
 * @returns {number|null} 残り時間（ミリ秒）、または null（期限なし）
 */
export const getTimeLeftInMs = (deadline) => {
  if (!deadline) return null;
  
  const diff = deadline - new Date();
  return diff > 0 ? diff : 0;
};

/**
 * 日付を相対時間で表示（例: 「3時間前」「昨日」）
 * 
 * @param {Date|string} date - 表示する日付
 * @returns {string} 相対時間の文字列
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  // 文字列の場合はDateオブジェクトに変換
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  
  if (diffInSec < 60) {
    return '今';
  } else if (diffInMin < 60) {
    return `${diffInMin}分前`;
  } else if (diffInHour < 24) {
    return `${diffInHour}時間前`;
  } else if (diffInDay < 7) {
    return `${diffInDay}日前`;
  } else {
    return formatDate(dateObj);
  }
};
