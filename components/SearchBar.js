// components/SearchBar.js
import React, { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, reports }) {
  const [userNames, setUserNames] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  
  // reports プロップから一意のユーザー名を抽出するロジック
  useEffect(() => {
    if (reports && reports.length > 0) {
      // mongoDBの場合、userName フィールドに記入者名が入っている
      const names = reports.map(report => report.userName);
      const uniqueNames = [...new Set(names)].filter(Boolean); // null や undefined を除外
      
      console.log('検出されたユーザー名:', uniqueNames); // デバッグ用
      setUserNames(uniqueNames);
    }
  }, [reports]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedUser(value);
    onSearch(value); // 親コンポーネントに選択値を伝える
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="w-64">
        <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
          記入者で検索_test
        </label>
        <select
          id="user-filter"
          value={selectedUser}
          onChange={handleChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">すべて表示</option>
          {userNames.length > 0 ? (
            userNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))
          ) : (
            <option disabled>ユーザーがいません</option>
          )}
        </select>
      </div>
      {/* デバッグ情報（開発時のみ表示） */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-2 text-xs text-gray-500">
          検出ユーザー数: {userNames.length}
        </div>
      )}
    </div>
  );
}