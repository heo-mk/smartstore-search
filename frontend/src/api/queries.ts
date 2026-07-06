import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { NaverTrendItem, BackendResponse } from '../types';

export interface RecommendedItem {
  keyword: string;
  searchTrend: number;
  sellerCount: number;
  sellerLevel: string;
  recommendationScore: number;
  potential: string;
  localDetails?: any;
}

/**
 * 백엔드 `/api/trends` 엔드포인트를 호출하는 React Query 훅
 * @param keyword - 검색할 키워드 (기본값: '스마트스토어')
 * @param period - 조회 기간 (기본값: 7일)
 * @returns useQuery 결과 (data, isLoading, error)
 */
export function useTrendingKeywords(keyword: string = '스마트스토어', period: number = 7) {
  return useQuery<NaverTrendItem[], Error>({
    queryKey: ['trendingKeywords', keyword, period],
    queryFn: async () => {
      try {
        const response = await apiClient.get<BackendResponse<NaverTrendItem[]>>(
          '/trends',
          {
            params: { keyword, period }
          }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.error || '데이터 로드 실패');
        }
        
        return response.data.data || [];
      } catch (error: any) {
        console.error('Trending Keywords Error:', error);
        throw new Error(error.response?.data?.error || error.message || '네트워크 오류가 발생했습니다.');
      }
    },
    staleTime: 1000 * 60 * 60,  // 1시간 (이 시간 동안은 캐시 사용)
    gcTime: 1000 * 60 * 60 * 24, // 24시간 (메모리에서 유지)
    retry: 2,                     // 실패 시 2회 재시도
    enabled: !!keyword,           // keyword가 존재할 때만 요청
  });
}

/**
 * 새로운 훅: 추천 아이템 조회
 * useTrendingKeywords() 아래에 추가
 */
export function useRecommendedItems() {
  return useQuery<RecommendedItem[], Error>({
    queryKey: ['recommendedItems'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<BackendResponse<RecommendedItem[]>>(
          '/trends/recommended'
        );
        
        if (!response.data.success) {
          throw new Error(response.data.error || '추천 데이터 로드 실패');
        }
        
        return response.data.data || [];
      } catch (error: any) {
        console.error('Recommended Items Error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    enabled: false,  // 중요: 수동으로 호출할 때만 실행
  });
}

