import { useFavoriteStore } from '../store/favoriteStore';

interface ItemDetailsProps {
  item: {
    keyword: string;
    latestRatio?: number;
    sellerCount?: number;
    sellerLevel?: string;
    potential?: string;
  } | null;
}

export function ItemDetails({ item }: ItemDetailsProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();

  if (!item) {
    return (
      <div className="item-details empty-state">
        <p>왼쪽 목록에서 아이템을 선택하여 상세 분석 정보를 확인하세요.</p>
      </div>
    );
  }

  const isFav = isFavorite(item.keyword);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(item.keyword);
    } else {
      addFavorite({
        keyword: item.keyword,
        latestRatio: item.latestRatio || 0,
        sellerCount: item.sellerCount || 0,
        sellerLevel: item.sellerLevel || '알 수 없음',
        potential: item.potential || '보통',
        addedAt: new Date().toISOString()
      });
    }
  };

  const getSellerLevelClass = (level?: string) => {
    if (level === '매우 적음' || level === '적음') return 'badge-low'; // 낮은 경쟁 -> 녹색/긍정
    if (level === '보통') return 'badge-medium';
    return 'badge-high'; // 높은 경쟁 -> 적색/부정
  };

  const getPotentialClass = (potential?: string) => {
    if (potential === '매우 높음' || potential === '높음') return 'badge-low'; // 높음 -> 녹색/긍정
    if (potential === '보통') return 'badge-medium';
    return 'badge-high';
  };

  return (
    <div className="item-details">
      <div className="details-header">
        <span className="category-label">실시간 트렌드 분석</span>
        <h2>{item.keyword}</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">최근 검색비율</span>
          <span className="metric-badge badge-info">
            {item.latestRatio !== undefined ? `${item.latestRatio.toFixed(1)}%` : '정보 없음'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">시장 경쟁도</span>
          <span className={`metric-badge ${getSellerLevelClass(item.sellerLevel)}`}>
            {item.sellerLevel || '정보 없음'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">판매 상품 수</span>
          <span className="metric-badge badge-neutral">
            {item.sellerCount !== undefined ? `${item.sellerCount.toLocaleString()}개` : '정보 없음'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">소싱 잠재력</span>
          <span className={`metric-badge ${getPotentialClass(item.potential)}`}>
            {item.potential || '정보 없음'}
          </span>
        </div>
      </div>

      <div className="details-actions">
        <button 
          className={`favorite-toggle-btn ${isFav ? 'active' : ''}`}
          onClick={handleToggleFavorite}
        >
          {isFav ? '♥ 찜 해제' : '♡ 찜하기'}
        </button>
      </div>
    </div>
  );
}
