import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';
import Report from '../../models/Report';

// 注: この API は開発環境でのみ使用し、本番環境では削除または保護すべき
export default async function handler(req, res) {
  // 開発環境以外ではアクセス不可
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Access denied in production mode' });
  }

  try {
    // データベースに接続
    await connectToDatabase();
    
    // ユーザー数の取得
    const userCount = await User.countDocuments();
    
    // ユーザー一覧の取得（パスワードを除く）
    const users = await User.find().select('-password').lean();
    
    // 日報数の取得
    const reportCount = await Report.countDocuments();
    
    // 最近の日報の取得
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // デバッグ情報を返す
    return res.status(200).json({
      users: {
        count: userCount,
        list: users
      },
      reports: {
        count: reportCount,
        recent: recentReports
      },
      database: {
        uri: process.env.MONGODB_URI ? 'Set correctly' : 'Not set',
        connection: 'Successful'
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
}