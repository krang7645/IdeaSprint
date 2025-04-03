// src/components/IdeaDetailScreen.jsx
import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import useIdeas from '../hooks/useIdeas';

const IdeaDetailScreen = ({ navigateTo, ideaId }) => {
  const { 
    selectedIdea, 
    loading, 
    error, 
    fetchIdea, 
    submitStep, 
    calculateTimeLeft, 
    getStatusColor 
  } = useIdeas();
  
  const [stepContent, setStepContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // コンポーネントマウント時にアイデア詳細を取得
  useEffect(() => {
    if (ideaId) {
      fetchIdea(ideaId);
    }
  }, [ideaId, fetchIdea]);
  
  // 選択されたアイデアが変更されたときにステップの内容を設定
  useEffect(() => {
    if (selectedIdea) {
      if (selectedIdea.step === 1) {
        setStepContent(selectedIdea.description || '');
      } else if (selectedIdea.step === 2) {
        setStepContent(selectedIdea.research || '');
      } else if (selectedIdea.step === 3) {
        setStepContent(selectedIdea.prototype || '');
      } else if (selectedIdea.step === 4) {
        setStepContent(selectedIdea.release || '');
      }
    }
  }, [selectedIdea]);
  
  // ステップ提出処理
  const handleSubmitStep = async () => {
    if (!selectedIdea || !stepContent.trim()) {
      setSubmitError('内容を入力してください');
      return;
    }
    
    // ステップ1の場合、100文字以上の説明が必要
    if (selectedIdea.step === 1 && stepContent.length < 100) {
      setSubmitError('説明は100文字以上で入力してください');
      return;
    }
    
    setSubmitError(null);
    setSubmitting(true);
    
    try {
      const result = await submitStep(selectedIdea.id, stepContent);
      if (result?.success) {
        alert(`ステップ${selectedIdea.step}を完了しました！`);
      }
    } catch (err) {
      console.error("ステップ提出エラー:", err);
      setSubmitError('ステップの提出に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <button 
          onClick={() => navigateTo('home')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ChevronRight size={16} className="transform rotate-180 mr-1" />
          ダッシュボードに戻る
        </button>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedIdea) {
    return (
      <div className="p-4">
        <button 
          onClick={() => navigateTo('home')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ChevronRight size={16} className="transform rotate-180 mr-1" />
          ダッシュボードに戻る
        </button>
        <div>アイデアが選択されていません</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button 
        onClick={() => navigateTo('home')}
        className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
      >
        <ChevronRight size={16} className="transform rotate-180 mr-1" />
        ダッシュボードに戻る
      </button>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{selectedIdea.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedIdea.status)}`}>
            {selectedIdea.status}
          </span>
        </div>
        
        {selectedIdea.deadline && selectedIdea.status === "進行中" && (
          <div className="mt-2 flex items-center text-sm font-medium">
            <Clock size={16} className="mr-1 text-red-500" />
            <span className={`${calculateTimeLeft(selectedIdea.deadline).includes("時間") && parseInt(calculateTimeLeft(selectedIdea.deadline)) < 3 ? "text-red-500" : ""}`}>
              残り {calculateTimeLeft(selectedIdea.deadline)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-indigo-600 rounded-full" 
              style={{ width: `${(selectedIdea.step / 4) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className={`text-center ${step <= selectedIdea.step ? "text-indigo-600 font-medium" : "text-gray-400"}`}
                style={{ width: '25%' }}
              >
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${step <= selectedIdea.step ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                  {step < selectedIdea.step ? <Check size={14} /> : step}
                </div>
                <p className="text-xs mt-1">
                  {step === 1 && "概要記述"}
                  {step === 2 && "調査提出"}
                  {step === 3 && "プロトタイプ提出"}
                  {step === 4 && "リリース報告"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 現在のステップの詳細と入力欄 */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        <h2 className="font-bold text-lg mb-2">
          {selectedIdea.step === 1 && "STEP 1: アイデア概要"}
          {selectedIdea.step === 2 && "STEP 2: 調査結果"}
          {selectedIdea.step === 3 && "STEP 3: プロトタイプ"}
          {selectedIdea.step === 4 && "STEP 4: リリース報告"}
        </h2>
        
        {selectedIdea.status === "進行中" ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              {selectedIdea.step === 1 && "アイデアの概要を100文字以上で記述してください。"}
              {selectedIdea.step === 2 && "競合調査や市場分析の結果を記述してください。"}
              {selectedIdea.step === 3 && "プロトタイプのURLまたはスクリーンショットを添付してください。"}
              {selectedIdea.step === 4 && "リリースしたサービスのURLと簡単な説明を記述してください。"}
            </p>
            
            <textarea 
              className="w-full border rounded-lg p-3 min-h-32 mb-3"
              placeholder={selectedIdea.step === 1 ? "例: スマホのカメラで植物を撮影し、AIが状態を判断して最適なケア方法を提案するアプリ。" : ""}
              value={stepContent}
              onChange={(e) => setStepContent(e.target.value)}
            />
            
            {submitError && (
              <div className="mb-3 text-sm text-red-600">
                {submitError}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedIdea.status === "進行中" && <span>残り{calculateTimeLeft(selectedIdea.deadline)}で自動削除されます</span>}
              </div>
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                onClick={handleSubmitStep}
                disabled={submitting}
              >
                {submitting ? '提出中...' : '提出する'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            {selectedIdea.step === 1 && selectedIdea.description && (
              <p className="whitespace-pre-line">{selectedIdea.description}</p>
            )}
            {selectedIdea.step === 2 && selectedIdea.research && (
              <p className="whitespace-pre-line">{selectedIdea.research}</p>
            )}
            {selectedIdea.step === 3 && selectedIdea.prototype && (
              <div>
                <a href={selectedIdea.prototype} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  <ExternalLink size={14} className="mr-1" /> {selectedIdea.prototype}
                </a>
              </div>
            )}
            {selectedIdea.step === 4 && selectedIdea.release && (
              <div>
                <a href={selectedIdea.release} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  <ExternalLink size={14} className="mr-1" /> {selectedIdea.release}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 過去の記録ログ */}
      {selectedIdea.timestamp && selectedIdea.timestamp.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2">提出履歴</h2>
          <div className="border rounded-lg divide-y">
            {selectedIdea.timestamp.map((log, index) => (
              <div key={index} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">STEP {log.step}: </span>
                  <span className="text-gray-600">
                    {log.step === 1 && "概要記述"}
                    {log.step === 2 && "調査提出"}
                    {log.step === 3 && "プロトタイプ提出"}
                    {log.step === 4 && "リリース報告"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{log.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaDetailScreen;