import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';

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
    
    // ユーザー名が既に存在するか確認
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 新しいユーザーの作成
    const user = await User.create({
      username,
      password: hashedPassword
    });
    
    // レスポンスを返す
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}