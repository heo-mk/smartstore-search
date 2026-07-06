import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalItem } from '../types';

interface FavoriteStore {
  // 상태
  favorites: LocalItem[];
  
  // 액션
  addFavorite: (item: LocalItem) => void;
  removeFavorite: (id: number) => void;
  getFavorites: () => LocalItem[];
  isFavorite: (id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      favorites: [],

      // 찜하기 추가
      addFavorite: (item: LocalItem) => {
        set((state) => {
          // 이미 찜한 아이템이면 추가하지 않음
          if (state.favorites.some(fav => fav.id === item.id)) {
            return state;
          }
          return {
            favorites: [...state.favorites, item],
          };
        });
      },

      // 찜하기 제거
      removeFavorite: (id: number) => {
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.id !== id),
        }));
      },

      // 찜한 아이템 조회 (getter 아님 - 함수)
      getFavorites: () => {
        return get().favorites;
      },

      // 특정 아이템이 찜되어 있는지 확인
      isFavorite: (id: number) => {
        return get().favorites.some(fav => fav.id === id);
      },
    }),
    {
      name: 'favorite-store',  // localStorage 키 이름
    }
  )
);
