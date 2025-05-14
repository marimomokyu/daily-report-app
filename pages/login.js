// pages/login.js の完全修正版

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // タブ状態（login or register）
  const [activeTab, setActiveTab] = useState('login');
  
  // ログイン用の状態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 登録用の状態
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, authError, clearAuthError } = useAuth();
  const router = useRouter();
  
  // 認証エラーを監視して表示
  useEffect(() => {
    if (authError) {
      setError(authError);
      clearAuthError();
    }
  }, [authError, clearAuthError]);
  
  // 既に認証されている場合はホームページにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  // タブの切り替え
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };
  
  // ログイン処理
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // 入力検証
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 認証コンテキストのlogin関数を呼び出し
      const success = await login(username, password);
      
      if (success) {
        // ログイン成功時はホームページにリダイレクト
        router.push('/');
      }
      // エラーは useEffect で authError から取得して表示
    } catch (err) {
      // 予期せぬエラー
      console.error('Unexpected login error:', err);
      setError('予期せぬエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // アカウント登録処理
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 入力検証
    if (!newUsername || !newPassword || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // エラーメッセージをセット
        setError(data.message || 'アカウント作成に失敗しました');
        setIsLoading(false);
        return;
      }
      
      // 登録成功
      setSuccess('アカウントが作成されました。ログインしてください。');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      
      // ログインタブに切り替え
      setTimeout(() => {
        handleTabChange('login');
        setUsername(newUsername); // 登録したユーザー名を自動入力
      }, 1500);
      
    } catch (err) {
      // ネットワークエラーなど
      console.error('Registration error:', err);
      setError('アカウント作成中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <Head>
        <title>{activeTab === 'login' ? 'ログイン' : 'アカウント作成'} | 日報アプリ</title>
      </Head>
      
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">日報アプリ</h2>
          <p className="mt-2 text-sm text-gray-600">
            チームの活動を記録・共有するためのアプリケーション
          </p>
        </div>
        
        {/* タブUI */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`w-1/2 py-4 px-6 text-center ${
                activeTab === 'login'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('login')}
              type="button"
            >
              ログイン
            </button>
            <button
              className={`w-1/2 py-4 px-6 text-center ${
                activeTab === 'register'
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('register')}
              type="button"
            >
              アカウント作成
            </button>
          </div>
          
          <div className="p-6">
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* 成功メッセージ */}
            {success && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            {/* ログインフォーム */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    ユーザー名
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    パスワード
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isLoading ? 'ログイン中...' : 'ログイン'}
                  </button>
                </div>
              </form>
            )}
            
            {/* アカウント登録フォーム */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label htmlFor="new-username" className="block text-sm font-medium text-gray-700">
                    ユーザー名
                  </label>
                  <div className="mt-1">
                    <input
                      id="new-username"
                      name="new-username"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    パスワード
                  </label>
                  <div className="mt-1">
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">6文字以上で入力してください</p>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    パスワード（確認）
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isLoading ? '作成中...' : 'アカウント作成'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* デモ用のログイン情報ヒント（本番環境では削除する） */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            デモ用アカウント: username = admin, password = admin123
          </p>
        </div>
      </div>
    </div>
  );
}