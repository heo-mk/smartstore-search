import type { RecommendedItem } from '../api/queries';
import type { LocalItem } from '../types';


interface RecommendedListProps {
  items: RecommendedItem[];
  isLoading: boolean;
  error: Error | null;
  onSelectItem: (item: LocalItem) => void;
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
      
      {items.map((item, idx) => (
        <div 
          key={item.keyword}
          className="recommended-item"
          onClick={() => item.localDetails && onSelectItem(item.localDetails)}
        >
          <div className="rank">{idx + 1}</div>
          
          <div className="item-info">
            <h4>{item.keyword}</h4>
            <p className="description">
              검색 트렌드: <strong>{item.searchTrend.toFixed(1)}</strong> | 
              판매자: <strong>{item.sellerLevel}</strong> ({item.sellerCount}명)
            </p>
          </div>

          <div className="scores">
            <div className="score-badge">
              <span className="label">추천도</span>
              <span className="value">{item.recommendationScore.toFixed(1)}</span>
            </div>
            <div className={`potential ${item.potential.replace(/\s/g, '-').toLowerCase()}`}>
              {item.potential}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
