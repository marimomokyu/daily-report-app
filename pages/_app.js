// pages/_app.js
// アプリケーションラッパー
// すべてのページで共通のレイアウトと認証コンテキストを提供

import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;