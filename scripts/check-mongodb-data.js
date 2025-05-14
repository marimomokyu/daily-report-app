// scripts/check-mongodb-data.js
// MongoDB のデータを確認するスクリプト

const mongoose = require('mongoose');
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
}, { 
  timestamps: true,
  strict: false 
});

// レポートスキーマ
const ReportSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  title: String,
  content: String,
  date: Date
}, { 
  timestamps: true,
  strict: false 
});

// モデル定義
const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);

async function checkData() {
  try {
    // MongoDB に接続
    console.log('MongoDB に接続中...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('接続成功！');
    
    // ユーザーデータの確認
    const userCount = await User.countDocuments();
    console.log(`ユーザー数: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('-password').lean();
      console.log('ユーザー一覧:');
      users.forEach(user => {
        console.log(`- ID: ${user._id}, ユーザー名: ${user.username}`);
      });
    }
    
    console.log('\n----------------------------\n');
    
    // 日報データの確認
    const reportCount = await Report.countDocuments();
    console.log(`日報数: ${reportCount}`);
    
    if (reportCount > 0) {
      // 記入者の一覧
      const userNames = await Report.distinct('userName');
      console.log('記入者一覧:');
      userNames.forEach(name => {
        console.log(`- ${name}`);
      });
      
      // 最新の日報
      console.log('\n最新の日報:');
      const reports = await Report.find().sort({ createdAt: -1 }).limit(3).lean();
      reports.forEach(report => {
        console.log(`- ID: ${report._id}`);
        console.log(`  タイトル: ${report.title}`);
        console.log(`  記入者: ${report.userName}`);
        console.log(`  日付: ${new Date(report.date).toLocaleDateString('ja-JP')}`);
        console.log(`  作成日時: ${new Date(report.createdAt).toLocaleString('ja-JP')}`);
        console.log('---');
      });
      
      // フィールド名の確認
      console.log('\n日報のフィールド構造:');
      if (reports.length > 0) {
        const fields = Object.keys(reports[0]);
        console.log(fields.join(', '));
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('\n接続を閉じました');
  }
}

// スクリプト実行
checkData();