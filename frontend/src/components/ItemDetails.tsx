import type { LocalItem } from '../types';
import { useFavoriteStore } from '../store/favoriteStore';

interface ItemDetailsProps {
  item: LocalItem | null;
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

  const isFav = isFavorite(item.id);

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const getDifficultyClass = (level: string) => {
    if (level === '낮음') return 'badge-low';
    if (level === '중간') return 'badge-medium';
    return 'badge-high';
  };

  const getProfitabilityClass = (level: string) => {
    if (level === '높음') return 'badge-low'; // 수익성 높음 -> 긍정(녹색 tag)
    if (level === '중간') return 'badge-medium';
    return 'badge-high';
  };

  const getCompetitionClass = (level: string) => {
    if (level === '낮음') return 'badge-low'; // 경쟁 낮음 -> 긍정(녹색 tag)
    if (level === '중간') return 'badge-medium';
    return 'badge-high';
  };

  return (
    <div className="item-details">
      <div className="details-header">
        <span className="category-label">{item.category}</span>
        <h2>{item.name}</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">진입 난이도</span>
          <span className={`metric-badge ${getDifficultyClass(item.difficulty)}`}>
            {item.difficulty}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">예상 수익성</span>
          <span className={`metric-badge ${getProfitabilityClass(item.profitability)}`}>
            {item.profitability}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">경쟁 포화도</span>
          <span className={`metric-badge ${getCompetitionClass(item.competition)}`}>
            {item.competition}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">소싱 추천도</span>
          <span className="stars-value">
            {'⭐'.repeat(item.rating)}
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
