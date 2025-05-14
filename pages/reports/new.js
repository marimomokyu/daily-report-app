// pages/reports/new.js
// 新規日報作成ページ
// 日報のタイトル、日付、内容を入力して保存する

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function NewReport() {
  // 現在の日付をデフォルト値として設定
  const today = new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  // 日報の作成
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力検証
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    if (!content.trim()) {
      setError('内容を入力してください');
      return;
    }
    
    if (!date) {
      setError('日付を入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          date,
          userId: user.id,
          userName: user.username,
        }),
      });
      
      if (!response.ok) {
        throw new Error('日報の作成に失敗しました');
      }
      
      // 作成成功後は一覧ページに戻る
      router.push('/');
    } catch (err) {
      setError(err.message);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Layout title="新規日報作成 | 日報アプリ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 戻るボタン */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            ← 日報一覧に戻る
          </button>
        </div>
        
        {/* フォームタイトル */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">新規日報作成</h2>
          <p className="mt-1 text-sm text-gray-500">
            今日の活動内容を記録してください
          </p>
        </div>
        
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* 日報フォーム */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    日付
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    タイトル
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="日報のタイトルを入力してください"
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    内容
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      name="content"
                      rows={10}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="今日の活動内容を詳しく入力してください"
                      required
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    複数行の入力が可能です。箇条書きや段落を使って読みやすく記入してください。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}