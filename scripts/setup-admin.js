// scripts/setup-admin.js
// 初期管理者ユーザーを作成するスクリプト

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI が設定されていません');
  process.exit(1);
}

// ユーザースキーマ
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function setupAdmin() {
  try {
    // MongoDB に接続
    console.log('MongoDB に接続中...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('接続成功！');
    
    // 管理者ユーザーが既に存在するか確認
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('管理者ユーザーは既に存在します');
      return;
    }
    
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // 管理者ユーザーの作成
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword
    });
    
    await adminUser.save();
    console.log('管理者ユーザーを作成しました');
    console.log('ユーザー名: admin');
    console.log('パスワード: admin123');
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('接続を閉じました');
  }
}

setupAdmin();