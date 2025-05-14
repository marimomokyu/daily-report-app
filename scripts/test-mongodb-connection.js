// scripts/simple-mongodb-test.js
// 単純な MongoDB 接続テスト

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 環境変数を読み込む
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI が設定されていません');
  process.exit(1);
}

// スキーマとモデルを定義
const TestSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('SimpleTest', TestSchema);

async function runTest() {
  try {
    // MongoDB に接続
    console.log('MongoDB に接続中...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('接続成功！');
    
    // テストドキュメントの作成
    console.log('テストデータを作成中...');
    const testDoc = new Test({ message: 'Hello MongoDB ' + new Date().toISOString() });
    
    // 保存
    const saved = await testDoc.save();
    console.log('ドキュメント保存成功:', saved._id);
    
    // 読み取り
    const found = await Test.findById(saved._id);
    console.log('ドキュメント読み取り成功:', found.message);
    
    // 削除
    await Test.deleteOne({ _id: saved._id });
    console.log('ドキュメント削除成功');
    
    console.log('テスト完了！');
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('接続を閉じました');
  }
}

runTest();