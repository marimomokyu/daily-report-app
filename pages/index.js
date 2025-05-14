// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import DebugInfo from '../components/DebugInfo';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // 日報データの取得
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        console.log('APIレスポンス:', data); // デバッグ用
        
        // MongoDB のフィールド名をフロントエンド側のプロパティ名に合わせる
        const normalizedData = data.map(item => ({
          id: item._id || item.id, // MongoDB は _id を使用
          _id: item._id || item.id, // 両方持たせておく
          userId: item.userId,
          userName: item.userName, // この名前が正しいか確認
          title: item.title || '',
          content: item.content || '',
          date: item.date,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        console.log('正規化したデータ:', normalizedData.length); // デバッグ用
        
        setReports(normalizedData);
        setFilteredReports(normalizedData);
      } catch (err) {
        setError('日報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);

  // ユーザーによるフィルタリング
  const handleUserFilter = (userName) => {
    console.log('選択されたユーザー:', userName); // デバッグ用
    
    if (!userName) {
      // フィルターなし - 全ての日報を表示
      setFilteredReports(reports);
    } else {
      // 選択されたユーザーの日報のみ表示
      const filtered = reports.filter(report => report.userName === userName);
      console.log(`${userName} の日報: ${filtered.length}件`); // デバッグ用
      setFilteredReports(filtered);
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
      return dateString;
    }
  };

  // 日報詳細ページへの遷移
  const navigateToReportDetail = (report) => {
    const reportId = report._id || report.id;
    if (!reportId) {
      console.error('無効な日報ID:', report);
      return;
    }
    
    console.log('詳細ページへ遷移:', reportId);
    router.push(`/reports/${reportId}`);
  };

  return (
    <Layout title="日報一覧 | 日報アプリ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 上部アクション */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">日報一覧</h2>
          <button
            onClick={() => router.push('/reports/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            新規作成
          </button>
        </div>

        {/* デバッグ情報 - 開発環境でのみ表示 */}
        {process.env.NODE_ENV !== 'production' && (
          <DebugInfo data={reports} title="APIから取得した日報データ" />
        )}

        {/* 検索フィルター - reports を渡す */}
        {!loading && reports.length > 0 && (
          <SearchBar 
            onSearch={handleUserFilter} 
            reports={reports} 
          />
        )}
        
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
        ) : filteredReports.length === 0 ? (
          // 日報がない場合
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">
              {reports.length === 0 ? '日報がありません' : '条件に一致する日報がありません'}
            </p>
            <button
              onClick={() => router.push('/reports/new')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              {reports.length === 0 ? '最初の日報を作成' : '新しい日報を作成'}
            </button>
          </div>
        ) : (
          // 日報一覧
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <li 
                  key={report._id || report.id}
                  onClick={() => navigateToReportDetail(report)}
                  className="block hover:bg-gray-50 cursor-pointer"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-blue-600 truncate">
                        {report.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {report.userName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {report.content && report.content.length > 100 
                            ? report.content.substring(0, 100) + '...' 
                            : report.content}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{formatDate(report.date)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}