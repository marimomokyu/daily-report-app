// scripts/add-sample-reports.js
// サンプル日報データを追加するスクリプト

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI が設定されていません');
  process.exit(1);
}

// スキーマ定義
const ReportSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  title: String,
  content: String,
  date: Date
}, { timestamps: true });

const Report = mongoose.model('Report', ReportSchema);

// サンプル日報の作成関数
async function addSampleReports() {
  try {
    // MongoDB に接続
    console.log('MongoDB に接続中...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('接続成功！');
    
    // 既存の日報数を確認
    const count = await Report.countDocuments();
    console.log(`現在の日報数: ${count}`);
    
    if (count > 0) {
      console.log('日報データは既に存在します。');
      
      // 記入者の一覧を表示
      const users = await Report.distinct('userName');
      console.log('存在する記入者一覧:');
      users.forEach(name => console.log(`- ${name}`));
      
      // スキップするか確認
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('既存のデータがありますが、サンプルデータを追加しますか？(y/n): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('処理を中止します。');
        await mongoose.disconnect();
        return;
      }
    }
    
    // サンプルユーザー
    const users = [
      { id: '1', name: '山田太郎' },
      { id: '2', name: '佐藤花子' },
      { id: '3', name: '鈴木一郎' }
    ];
    
    // サンプル日報データ
    const sampleReports = [];
    
    // 各ユーザーの日報を作成
    for (const user of users) {
      // 3日分の日報を作成
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        sampleReports.push({
          userId: user.id,
          userName: user.name,
          title: `${user.name}の日報 ${i + 1}`,
          content: `${date.toLocaleDateString('ja-JP')}の活動内容\n\n・ミーティング参加\n・資料作成\n・タスク${i + 1}完了`,
          date: date
        });
      }
    }
    
    // データベースに保存
    const result = await Report.insertMany(sampleReports);
    console.log(`${result.length} 件のサンプル日報を追加しました`);
    
    // 追加した日報の記入者を確認
    const addedUsers = await Report.distinct('userName');
    console.log('追加した記入者一覧:');
    addedUsers.forEach(name => console.log(`- ${name}`));
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('接続を閉じました');
  }
}

// スクリプト実行
addSampleReports();