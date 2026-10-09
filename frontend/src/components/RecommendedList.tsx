import { useEffect, useState } from 'react';
import type { RecommendedItem } from '../api/queries';

interface RecommendedListProps {
  items: RecommendedItem[];
  totalCount?: number;
  analyzedCount?: number;
  updatedAt?: number;
  isLoading: boolean;
  error: Error | null;
  onSelectItem: (item: {
    keyword: string;
    latestRatio: number;
  }) => void;
}

function formatFetchedAt(updatedAt: number, now: number): string {
  const minutes = Math.floor((now - updatedAt) / 60000);
  return minutes < 1 ? '방금 조회' : `${minutes}분 전 조회`;
}

export function RecommendedList({ 
  items, 
  totalCount,
  analyzedCount,
  updatedAt,
  isLoading, 
  error, 
  onSelectItem 
}: RecommendedListProps) {
  const [now, setNow] = useState(() => Date.now());

  // 조회 시각 표시를 1분마다 갱신
  useEffect(() => {
    if (!updatedAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [updatedAt]);

  if (isLoading) {
    return (
      <div className="recommended-list loading">
        <p>🔍 최고의 아이템을 찾는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommended-list error">
        <p>❌ 오류: {error.message}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="recommended-list empty">
        <p>추천할 아이템이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="recommended-list">
      <div className="recommended-title">
        <h3>🌟 추천 아이템 TOP {items.length}</h3>
        {updatedAt ? (
          <span className="fetched-at">{formatFetchedAt(updatedAt, now)}</span>
        ) : null}
      </div>
      {analyzedCount !== undefined && totalCount !== undefined && (
        <small className="analysis-summary">
          {totalCount}개 키워드 중 {analyzedCount}개 분석 · 상위 {items.length}개 표시
          {analyzedCount < totalCount && ' · 일부 키워드는 조회에 실패했습니다'}
        </small>
      )}
      
      <div className="list-container">
        {items.map((item, idx) => (
          <div 
            key={item.keyword}
            className="recommended-item"
            onClick={() => onSelectItem({
              keyword: item.keyword,
              latestRatio: item.searchTrend
            })}
          >
            <div className="rank">{idx + 1}</div>
            
            <div className="item-content-wrapper">
              <div className="item-row-top">
                <h4>{item.keyword}</h4>
              </div>
              
              <div className="item-row-bottom">
                <p className="description">
                  <span className="trend-info">검색 트렌드: <strong>{item.searchTrend.toFixed(1)}%</strong></span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
