// pages/reports/[id].js
// 日報詳細ページ
// 特定の日報の詳細を表示し、編集・削除機能を提供

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function ReportDetail() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  
  // 日報データの取得
  useEffect(() => {
    // ルーターがまだ準備できていない場合
    if (!router.isReady) {
      return;
    }
    
    const { id } = router.query;
    
    // ID が未定義または空の場合
    if (!id || id === 'undefined') {
      setError('無効な日報IDです');
      setLoading(false);
      return;
    }
    
    async function fetchReport() {
      try {
        console.log('日報ID:', id); // デバッグ用
        setLoading(true);
        const response = await fetch(`/api/reports/${id}`);
        
        if (!response.ok) {
          console.error('APIエラー:', response.status, response.statusText);
          if (response.status === 404) {
            throw new Error('日報が見つかりません');
          }
          throw new Error('日報の取得に失敗しました');
        }
        
        const data = await response.json();
        console.log('取得した日報データ:', data); // デバッグ用
        
        // データの正規化
        const normalizedReport = {
          id: data._id || data.id,
          _id: data._id || data.id,
          userId: data.userId,
          userName: data.userName,
          title: data.title || '',
          content: data.content || '',
          date: data.date,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        setReport(normalizedReport);
      } catch (err) {
        console.error('日報取得エラー:', err);
        setError(err.message || '日報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    
    fetchReport();
  }, [router.isReady, router.query]); // router.isReady と router.query の変更を監視

  // 日報の削除
  const handleDelete = async () => {
    try {
      const id = report._id || report.id;
      if (!id) {
        throw new Error('無効な日報IDです');
      }
      
      setLoading(true);
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '日報の削除に失敗しました');
      }
      
      // 削除成功したら一覧ページに戻る
      router.push('/');
    } catch (err) {
      setError(err.message || '日報の削除に失敗しました');
      console.error(err);
      setLoading(false);
    }
  };

  // 日付フォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', options);
    } catch (e) {
      console.error('日付フォーマットエラー:', e);
      return dateString.toString();
    }
  };

  // 時刻フォーマット
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const options = { hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleTimeString('ja-JP', options);
    } catch (e) {
      console.error('時刻フォーマットエラー:', e);
      return '';
    }
  };

  // ユーザーID比較（所有者かどうか確認）
  const isOwner = () => {
    if (!user || !report) return false;
    
    // MongoDB の ObjectId を文字列として比較
    const userId = user.id;
    const reportUserId = report.userId;
    
    console.log('ユーザーID比較:', userId, reportUserId); // デバッグ用
    return userId === reportUserId;
  };

  return (
    <Layout title={report ? `${report.title} | 日報アプリ` : '日報詳細 | 日報アプリ'}>
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
        
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* ローディング */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : report ? (
          /* 日報詳細 */
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  日付: {formatDate(report.date)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  記入者: {report.userName}
                </p>
              </div>
              
              {/* 編集・削除ボタン（自分の日報のみ） */}
              {isOwner() && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/reports/edit/${report._id || report.id}`)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="prose max-w-none">
                  {report.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
              <p className="text-xs text-gray-500">
                最終更新: {formatDate(report.updatedAt)} {formatTime(report.updatedAt)}
              </p>
            </div>
          </div>
        ) : null}
        
        {/* 削除確認モーダル */}
        {deleteConfirm && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900">日報を削除しますか？</h3>
              <p className="mt-2 text-sm text-gray-500">
                この操作は元に戻せません。本当に削除しますか？
              </p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}