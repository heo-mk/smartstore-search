import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteItem } from '../types';

interface FavoriteStore {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (keyword: string) => void;
  getFavorites: () => FavoriteItem[];
  isFavorite: (keyword: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (item: FavoriteItem) => {
        set((state) => {
          if (state.favorites.some(fav => fav.keyword === item.keyword)) {
            return state;
          }
          return { favorites: [...state.favorites, item] };
        });
      },

      removeFavorite: (keyword: string) => {
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.keyword !== keyword),
        }));
      },

      getFavorites: () => get().favorites,

      isFavorite: (keyword: string) => {
        return get().favorites.some(fav => fav.keyword === keyword);
      },
    }),
    {
      name: 'favorite-store',
      // 옛 데이터(제거된 필드 포함)를 읽어도 오류가 나지 않도록 필요한 필드만 남김
      merge: (persisted, current) => {
        const saved = (persisted as { favorites?: unknown } | undefined)?.favorites;
        const favorites: FavoriteItem[] = Array.isArray(saved)
          ? saved
              .filter((fav) => fav && typeof fav.keyword === 'string')
              .map((fav) => ({
                keyword: fav.keyword,
                latestRatio: typeof fav.latestRatio === 'number' ? fav.latestRatio : 0,
                addedAt: typeof fav.addedAt === 'string' ? fav.addedAt : new Date().toISOString(),
              }))
          : [];
        return { ...current, favorites };
      },
    }
  )
);
