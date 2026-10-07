import { useFavoriteStore } from '../store/favoriteStore';
import type { NaverTrendItem } from '../types';

interface ItemDetailsProps {
  item: {
    keyword: string;
    latestRatio?: number;
    dataPoints?: NaverTrendItem[];
  } | null;
}

export function ItemDetails({ item }: ItemDetailsProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  if (!item) {
    return (
      <div className="item-details empty-state">
        <p>
          {`왼쪽 목록에서 아이템을 선택하여
상세 분석 정보를 확인하세요.`}
        </p>
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
        addedAt: new Date().toISOString()
      });
    }
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
      </div>

      {item.dataPoints && item.dataPoints.length > 0 && (
        <div className="trend-chart-section">
          <h3>📈 일자별 검색 트렌드 추이</h3>
          <div className="chart-wrapper">
            {/* 세로축 (Y-axis) */}
            <div className="y-axis">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* 격자선 (Grid Lines) */}
            <div className="chart-grid-lines">
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
            </div>

            {/* 차트 영역 */}
            <div className="chart-container">
              {item.dataPoints.map((point) => (
                <div key={point.date} className="chart-bar-wrap" title={`${point.date}: ${point.ratio.toFixed(1)}%`}>
                  <div className="chart-bar-value">{point.ratio.toFixed(0)}%</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${Math.max(4, point.ratio)}%` }}
                    />
                  </div>
                  <div className="chart-bar-date">{formatDate(point.date)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
