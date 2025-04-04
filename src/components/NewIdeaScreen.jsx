// src/components/NewIdeaScreen.jsx
import React, { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import useIdeas from '../hooks/useIdeas';

const NewIdeaScreen = ({ navigateTo }) => {
  const { addNewIdea, loading, error } = useIdeas();

  const [newIdeaData, setNewIdeaData] = useState({
    title: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: ''
  });

  const handleCreateIdea = async () => {
    // 入力検証
    const errors = {};

    if (!newIdeaData.title.trim()) {
      errors.title = 'タイトルを入力してください';
    }

    if (!newIdeaData.description.trim()) {
      errors.description = '概要を入力してください';
    } else if (newIdeaData.description.length < 100) {
      errors.description = '概要は100文字以上で入力してください';
    }

    // エラーがあれば表示して処理を中断
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // エラーがなければリセット
    setFormErrors({ title: '', description: '' });

    // アイデア作成
    const result = await addNewIdea(newIdeaData);
    if (result) {
      alert('新しいアイデアが作成されました！');
      navigateTo('home');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigateTo('home')}
        className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
      >
        <ChevronRight size={16} className="transform rotate-180 mr-1" />
        ダッシュボードに戻る
      </button>

      <h1 className="text-2xl font-bold mb-6">新しいアイデアを追加</h1>

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

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            アイデアのタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3`}
            placeholder="例: AIを活用した健康管理アプリ"
            value={newIdeaData.title}
            onChange={(e) => setNewIdeaData({...newIdeaData, title: e.target.value})}
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            アイデアの概要説明 <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-2">
            ※ 100文字以上で入力してください（現在: {newIdeaData.description.length}文字）
          </p>
          <textarea
            className={`w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 min-h-32`}
            placeholder="あなたのアイデアを詳しく説明してください..."
            value={newIdeaData.description}
            onChange={(e) => setNewIdeaData({...newIdeaData, description: e.target.value})}
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">注意事項:</p>
            <ul className="text-xs text-gray-500 list-disc pl-5">
              <li>作成後、24時間以内にSTEP 2の調査結果を提出する必要があります</li>
              <li>期限内に次のステップに進まないとアイデアは消滅します</li>
              <li>消滅したアイデアは「墓場」に移動し、他のユーザーが引き継げるようになります</li>
            </ul>
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
            onClick={handleCreateIdea}
            disabled={loading}
          >
            {loading ? 'アイデア作成中...' : 'アイデアを作成する'}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">アイデアの消滅システムについて</h3>
            <p className="text-sm text-yellow-700 mt-1">
              本アプリでは、各ステップに期限が設定されています。期限内に次のステップに進まないと、
              アイデアは自動的に消滅し、あなたが獲得したポイントの一部が失われます。
              これは「先延ばし」を防ぎ、アイデアを形にするモチベーションを高めるための仕組みです。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewIdeaScreen;
