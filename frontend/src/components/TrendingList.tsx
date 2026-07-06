import { useTrendingKeywords } from '../api/queries';
import type { LocalItem } from '../types';
import items from '../data/items.json';

interface TrendingListProps {
  searchTerm: string;
  onSelectItem: (item: LocalItem) => void;
  onRecommendClick: () => void;
  isRecommendLoading: boolean;
}

export function TrendingList({ 
  searchTerm, 
  onSelectItem,
  onRecommendClick,
  isRecommendLoading
}: TrendingListProps) {
  // 사용자가 입력한 검색어 혹은 기본 키워드로 네이버 데이터랩 트렌드 API를 조회합니다.
  const { data: trending, isLoading, error } = useTrendingKeywords(searchTerm || '스마트스토어');

  // 로컬 데이터(items.json)를 불러와 LocalItem[] 타입으로 정의
  const localItems = items as LocalItem[];

  if (isLoading) {
    return <div className="loading-state">네이버 데이터랩 실시간 검색량 수집 중...</div>;
  }
  
  if (error) {
    return <div className="error-state">오류 발생: {error.message}</div>;
  }

  // 검색어와 매칭되거나, 백엔드 네이버 트렌드 응답에 매칭되는 로컬 상품 필터링
  let filteredItems = localItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trending?.some(t => t.keyword.toLowerCase().includes(item.name.toLowerCase()))
  );

  // 네이버 검색 비율(ratio)의 최근 날짜 값을 가져와서 트렌드 점수로 시각화
  const getTrendRatio = (itemName: string): number | null => {
    if (!trending || trending.length === 0) return null;
    const matches = trending.filter(t => t.keyword.toLowerCase().includes(itemName.toLowerCase()));
    if (matches.length === 0) return null;
    // 가장 최근 날짜의 ratio를 가져옴
    return matches[matches.length - 1].ratio;
  };

  return (
    <div className="trending-list">
      <div className="list-header">
        <h2>아이템 분석 목록</h2>
        <button 
          className="recommend-button"
          onClick={onRecommendClick}
          disabled={isRecommendLoading}
        >
          {isRecommendLoading ? '분석 중...' : '최고의 아이템 찾기'}
        </button>
      </div>
      {filteredItems.length === 0 ? (
        <p className="no-result">검색 결과와 일치하는 트렌드 아이템이 없습니다.</p>
      ) : (
        <div className="list-container">
          {filteredItems.map(item => {
            const ratio = getTrendRatio(item.name);
            return (
              <div
                key={item.id}
                className="trending-item-card"
                onClick={() => onSelectItem(item)}
              >
                <div className="item-meta">
                  <span className="category-tag">{item.category}</span>
                  <h3>{item.name}</h3>
                </div>
                {ratio !== null && (
                  <div className="trend-badge">
                    <span className="badge-title">최근 검색비율</span>
                    <span className="badge-value">{ratio.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
