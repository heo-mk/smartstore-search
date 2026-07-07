import type { RecommendedItem } from '../api/queries';

interface RecommendedListProps {
  items: RecommendedItem[];
  isLoading: boolean;
  error: Error | null;
  onSelectItem: (item: {
    keyword: string;
    latestRatio: number;
    sellerCount: number;
    sellerLevel: string;
    potential: string;
  }) => void;
}

export function RecommendedList({ 
  items, 
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
      
      <div className="list-container">
        {items.map((item, idx) => (
          <div 
            key={item.keyword}
            className="recommended-item"
            onClick={() => onSelectItem({
              keyword: item.keyword,
              latestRatio: item.searchTrend,
              sellerCount: item.sellerCount,
              sellerLevel: item.sellerLevel,
              potential: item.potential
            })}
          >
            <div className="rank">{idx + 1}</div>
            
            <div className="item-content-wrapper">
              <div className="item-row-top">
                <h4>{item.keyword}</h4>
                <div className={`potential ${item.potential.replace(/\s/g, '-').toLowerCase()}`}>
                  {item.potential}
                </div>
              </div>
              
              <div className="item-row-bottom">
                <p className="description">
                  <span className="trend-info">검색 트렌드: <strong>{item.searchTrend.toFixed(1)}%</strong></span>
                  <span className="seller-info">판매자: <strong>{item.sellerLevel}</strong> ({item.sellerCount.toLocaleString()}명)</span>
                </p>
                <div className="score-badge">
                  <span className="label">추천도</span>
                  <span className="value">{item.recommendationScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
