// models/Report.js
import mongoose from 'mongoose';

// レポートスキーマが定義済みかチェック
const ReportSchema = mongoose.models.Report?.schema || new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'ユーザーIDは必須です']
  },
  userName: {
    type: String,
    required: [true, 'ユーザー名は必須です']
  },
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, '内容は必須です'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, '日付は必須です']
  }
}, {
  timestamps: true
});

// モデルをエクスポート
const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

export default Report;