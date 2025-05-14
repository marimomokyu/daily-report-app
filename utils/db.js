// utils/db.js
// データベース操作のためのユーティリティ関数
// JSON-Serverを使用せず、ファイルシステムを直接操作する方法

import fs from 'fs';
import path from 'path';

// JSONファイルのパス
const dbFilePath = path.join(process.cwd(), 'data', 'db.json');

// JSONファイルの読み込み
export const getDatabase = () => {
  try {
    // データディレクトリが存在しない場合は作成
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    
    // データファイルが存在しない場合は作成
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(
        dbFilePath, 
        JSON.stringify({
          users: [
            {
              id: "1",
              username: "admin",
              password: "admin123" // 実際のアプリではハッシュ化する
            }
          ],
          reports: []
        }, null, 2)
      );
    }
    
    // データファイルを読み込み
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Database read error:', error);
    throw new Error('Failed to read database');
  }
};

// JSONファイルの書き込み
export const saveDatabase = (db) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Database write error:', error);
    throw new Error('Failed to write database');
  }
};

// レポート一覧を取得
export const getReports = () => {
  const db = getDatabase();
  // 日付の新しい順にソート
  return [...db.reports].sort((a, b) => new Date(b.date) - new Date(a.date));
};

// 特定のレポートを取得
export const getReportById = (id) => {
  const db = getDatabase();
  return db.reports.find(report => report.id === id) || null;
};

// 新しいレポートを作成
export const createReport = (reportData) => {
  const db = getDatabase();
  db.reports.push(reportData);
  saveDatabase(db);
  return reportData;
};

// レポートを更新
export const updateReport = (id, reportData) => {
  const db = getDatabase();
  const index = db.reports.findIndex(report => report.id === id);
  
  if (index !== -1) {
    db.reports[index] = { ...db.reports[index], ...reportData };
    saveDatabase(db);
    return db.reports[index];
  }
  
  return null;
};

// レポートを削除
export const deleteReport = (id) => {
  const db = getDatabase();
  const index = db.reports.findIndex(report => report.id === id);
  
  if (index !== -1) {
    db.reports.splice(index, 1);
    saveDatabase(db);
    return true;
  }
  
  return false;
};

// ユーザーを取得
export const getUserByUsername = (username) => {
  const db = getDatabase();
  return db.users.find(user => user.username === username) || null;
};