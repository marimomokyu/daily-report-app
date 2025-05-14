// components/Layout.js
// 共通レイアウトコンポーネント
// すべてのページで共通のヘッダーを表示する

import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title = '日報アプリ' }) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // ログインページには適用しない
  const isLoginPage = router.pathname === '/login';

  // 認証済み状態以外でログインページ以外にアクセスした場合はリダイレクト
  if (!isAuthenticated && !isLoginPage) {
    // useEffectでリダイレクトするよりも、レンダリングをブロックする方が良い
    // このコンポーネントがマウントされた後に（ユーザーが一瞬見える問題を避ける）
    typeof window !== 'undefined' && router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="日報を記録・閲覧するためのWebアプリケーション" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* ヘッダー（ログインページ以外で表示） */}
        {!isLoginPage && (
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <h1 
                onClick={() => router.push('/')}
                className="text-xl font-bold text-gray-900 cursor-pointer"
              >
                日報アプリ
              </h1>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span>{user.username}</span>
                  </div>
                )}
                <button 
                  onClick={logout}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </header>
        )}

        {/* メインコンテンツ */}
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </>
  );
}