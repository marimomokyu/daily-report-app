import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

// JWT秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // データベースに接続
    await connectToDatabase();
    
    const { username, password } = req.body;
    
    // 入力検証
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // ユーザーの検索
    const user = await User.findOne({ username }).lean();
    
    // ユーザーが存在しない場合
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // パスワードの検証
    // 注: 開発初期はパスワードを平文で比較する場合もありますが、本番環境ではハッシュ化すべき
    let isValid = false;
    
    // パスワードがハッシュ化されているか確認
    if (password === user.password) {
      // 開発用: 平文のパスワード比較（初期データの場合）
      isValid = true;
    } else {
      try {
        // bcryptでハッシュ化されたパスワードの比較
        isValid = await bcrypt.compare(password, user.password);
      } catch (err) {
        console.error('Password comparison error:', err);
        isValid = false;
      }
    }
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // JWTトークンの生成
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' } // トークンの有効期限: 7日間
    );
    
    // レスポンスを返す
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}