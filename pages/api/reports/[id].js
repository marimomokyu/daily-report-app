// pages/api/reports/[id].js
import connectToDatabase from '../../../lib/mongodb';
import Report from '../../../models/Report';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // ID が未定義または空の場合
  if (!id || id === 'undefined') {
    console.error('無効なID:', id);
    return res.status(400).json({ message: 'Valid report ID is required' });
  }
  
  try {
    console.log('API: 日報 ID =', id); // デバッグ用
    
    // データベースに接続
    await connectToDatabase();
    
    let reportId;
    let report;
    
    try {
      // MongoDB ObjectID に変換を試みる
      reportId = new mongoose.Types.ObjectId(id);
      
      // ObjectID で検索
      report = await Report.findById(reportId);
    } catch (err) {
      console.error('Invalid ID format:', err);
      
      // MongoDB の ObjectId 形式でない場合、文字列としての検索を試みる
      report = await Report.findOne({ id: id }).lean();
      
      if (!report) {
        return res.status(400).json({ 
          message: 'Invalid report ID format',
          detail: err.message 
        });
      }
    }
    
    // 日報が存在しない場合
    if (!report) {
      console.log('日報が見つかりません:', id);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // GET - 特定の日報の取得
    if (req.method === 'GET') {
      return res.status(200).json(report);
    }
    
    // PUT - 日報の更新
    if (req.method === 'PUT') {
      const { title, content, date } = req.body;
      
      // 入力検証
      if (!title || !content || !date) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // 日報の更新
      report.title = title;
      report.content = content;
      report.date = date;
      report.updatedAt = new Date();
      
      await report.save();
      
      return res.status(200).json(report);
    }
    
    // DELETE - 日報の削除
    if (req.method === 'DELETE') {
      if (reportId) {
        await Report.deleteOne({ _id: reportId });
      } else {
        await Report.deleteOne({ id: id });
      }
      
      return res.status(200).json({ message: 'Report deleted successfully' });
    }
    
    // その他のHTTPメソッドは許可しない
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error(`Error handling report ${id}:`, error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}