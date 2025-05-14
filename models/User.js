import mongoose from 'mongoose';

// ユーザースキーマが定義済みかチェック
const UserSchema = mongoose.models.User?.schema || new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'ユーザー名は必須です'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'パスワードは必須です'],
  }
}, {
  timestamps: true
});

// モデルをエクスポート
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;