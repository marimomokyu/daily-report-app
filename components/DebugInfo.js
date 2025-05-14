// components/DebugInfo.js
import React from 'react';

export default function DebugInfo({ data, title = 'デバッグ情報' }) {
  // 本番環境では表示しない
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="bg-gray-100 p-2 mb-4 text-xs rounded">
      <h4 className="font-bold">{title}:</h4>
      <p>データ件数: {data?.length || 0}</p>
      {data && data.length > 0 && (
        <>
          <p>プロパティ: {Object.keys(data[0]).join(', ')}</p>
          <details>
            <summary>詳細情報</summary>
            <p>ユーザー名: {
              [...new Set(data.map(d => d.userName))]
                .filter(Boolean)
                .join(', ')
            }</p>
            <pre className="mt-1 text-xs overflow-auto max-h-20">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}