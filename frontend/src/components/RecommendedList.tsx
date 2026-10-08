import type { RecommendedItem } from '../api/queries';

interface RecommendedListProps {
  items: RecommendedItem[];
  totalCount?: number;
  analyzedCount?: number;
  isLoading: boolean;
  error: Error | null;
  onSelectItem: (item: {
    keyword: string;
    latestRatio: number;
  }) => void;
}

export function RecommendedList({ 
  items, 
  totalCount,
  analyzedCount,
  isLoading, 
  error, 
  onSelectItem 
}: RecommendedListProps) {
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
      <h3>🌟 추천 아이템 TOP {items.length}</h3>
      {analyzedCount !== undefined && totalCount !== undefined && (
        <small className="analysis-summary">
          {totalCount}개 중 {analyzedCount}개 분석 완료
          {analyzedCount < totalCount && ' · 일부 키워드는 조회에 실패해 제외되었습니다'}
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
