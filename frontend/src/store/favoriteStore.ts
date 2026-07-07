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
    }
  )
);
