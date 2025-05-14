import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// 認証コンテキストの作成
const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  // アプリケーション起動時に認証状態を確認
  useEffect(() => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // JWT検証はサーバーサイドで行うべきだが、ここではシンプルにjwt-decodeを使う
        // 実際のアプリでは、/api/auth/meなどのエンドポイントでトークンを検証するべき
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // トークンの有効期限を確認
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();
        
        if (expirationDate > now) {
          setUser({
            id: payload.id,  // MongoDB の _id が id として格納される
            username: payload.username
          });
        } else {
          // トークンが期限切れの場合は削除
          console.log('Token expired');
          localStorage.removeItem('token');
          setAuthError('セッションの有効期限が切れました。再度ログインしてください。');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
        setAuthError('認証情報の検証に失敗しました。再度ログインしてください。');
      }
    }
    setLoading(false);
  }, []);

  // ログイン関数
  const login = async (username, password) => {
    try {
      setAuthError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || 'ログインに失敗しました');
        return false;
      }

      // トークンをローカルストレージに保存
      localStorage.setItem('token', data.token);
      
      // ユーザー情報をステートに保存
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('ログイン処理中にエラーが発生しました。ネットワーク接続を確認してください。');
      return false;
    }
  };

  // ログアウト関数
  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('ログアウト中にエラーが発生しました');
    }
  };

  // 認証状態のチェック
  const isAuthenticated = !!user;

  // エラーのクリア
  const clearAuthError = () => {
    setAuthError(null);
  };

  // コンテキストの値
  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    authError,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 認証コンテキストを使用するためのカスタムフック
export function useAuth() {
  return useContext(AuthContext);
}