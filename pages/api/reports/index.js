// pages/api/reports/index.js
import connectToDatabase from '../../../lib/mongodb';
import Report from '../../../models/Report';

export default async function handler(req, res) {
  try {
    // データベースに接続
    await connectToDatabase();
    
    // GET - 日報の一覧取得
    if (req.method === 'GET') {
      const reports = await Report.find()
        .sort({ date: -1 }) // 日付の新しい順にソート
        .lean();
      
      console.log('MongoDB から取得した日報数:', reports.length);
      if (reports.length > 0) {
        console.log('最初の日報のサンプル:', {
          id: reports[0]._id,
          userName: reports[0].userName,
          title: reports[0].title ? reports[0].title.substring(0, 20) + '...' : 'タイトルなし'
        });
      }
      
      return res.status(200).json(reports);
    }
    
    // POST - 新しい日報の作成
    if (req.method === 'POST') {
      const { title, content, date, userId, userName } = req.body;
      
      // 入力検証
      if (!title || !content || !date || !userId || !userName) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // 新しい日報の作成
      const report = await Report.create({
        title,
        content,
        date,
        userId,
        userName
      });
      
      return res.status(201).json(report);
    }
    
    // その他のHTTPメソッドは許可しない
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Error handling reports:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}