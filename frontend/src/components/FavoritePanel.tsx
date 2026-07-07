import { useFavoriteStore } from '../store/favoriteStore';
import type { FavoriteItem } from '../types';

interface FavoritePanelProps {
  onSelectItem: (item: FavoriteItem) => void;
}

export function FavoritePanel({ onSelectItem }: FavoritePanelProps) {
  const { getFavorites, removeFavorite } = useFavoriteStore();
  const favorites = getFavorites();

  return (
    <div className="favorite-panel">
      <h3>찜한 아이템 ({favorites.length})</h3>
      {favorites.length === 0 ? (
        <p className="empty-favorites">찜한 아이템이 없습니다.</p>
      ) : (
        <ul className="favorite-list">
          {favorites.map(item => (
            <li 
              key={item.keyword} 
              className="favorite-item"
              onClick={() => onSelectItem(item)}
            >
              <div className="fav-info">
                <span className="fav-name">{item.keyword}</span>
                <span className="fav-category">최근 검색비율 {typeof item.latestRatio === 'number' ? item.latestRatio.toFixed(1) : '0.0'}%</span>
              </div>
              <button 
                className="fav-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.keyword);
                }}
                title="제거"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
