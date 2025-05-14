// scripts/check-reports-data.js
// 日報データの確認スクリプト

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI が設定されていません');
  process.exit(1);
}

// Report スキーマ定義
const ReportSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  title: String,
  content: String,
  date: Date
}, { 
  timestamps: true,
  // スキーマ検証を緩くする（既存のデータが厳密な検証に失敗する可能性があるため）
  strict: false 
});

const Report = mongoose.model('Report', ReportSchema);

async function checkReportsData() {
  try {
    // MongoDB に接続
    console.log('MongoDB に接続中...');
    await mongoose.connect(MONGODB_URI);
    console.log('接続成功！');
    
    // 日報の総数を取得
    const count = await Report.countDocuments();
    console.log(`データベース内の日報数: ${count}`);
    
    if (count === 0) {
      console.log('⚠️ 日報データが存在しません。サンプルデータを作成してください。');
    } else {
      // 記入者（userName）の一覧を取得
      const users = await Report.distinct('userName');
      console.log('記入者一覧:');
      users.forEach(user => console.log(`  - ${user}`));
      
      // サンプルデータを取得
      console.log('\n最新の日報サンプル:');
      const samples = await Report.find().sort({ createdAt: -1 }).limit(2);
      samples.forEach(report => {
        console.log(`ID: ${report._id}`);
        console.log(`タイトル: ${report.title}`);
        console.log(`記入者: ${report.userName}`);
        console.log(`日付: ${report.date}`);
        console.log(`ユーザーID: ${report.userId}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('接続を閉じました');
  }
}

checkReportsData();