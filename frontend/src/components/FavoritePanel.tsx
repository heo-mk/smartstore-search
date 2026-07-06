import { useFavoriteStore } from '../store/favoriteStore';
import type { LocalItem } from '../types';

interface FavoritePanelProps {
  onSelectItem: (item: LocalItem) => void;
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
              key={item.id} 
              className="favorite-item"
              onClick={() => onSelectItem(item)}
            >
              <div className="fav-info">
                <span className="fav-name">{item.name}</span>
                <span className="fav-category">{item.category}</span>
              </div>
              <button 
                className="fav-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.id);
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
