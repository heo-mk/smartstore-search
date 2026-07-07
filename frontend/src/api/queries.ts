import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { NaverTrendItem, TrendItem, BackendResponse } from '../types';

export interface RecommendedItem {
  keyword: string;
  searchTrend: number;
  sellerCount: number;
  sellerLevel: string;
  recommendationScore: number;
  potential: string;
}

export interface BackendTrendResponse {
  trend: NaverTrendItem[];
  seller: {
    keyword: string;
    sellerCount: number;
    sellerLevel: string;
    potential: string;
  };
}

/**
 * 날짜별 NaverTrendItem[] 배열과 판매자 정보를 TrendItem 하나로 집계
 */
function aggregateTrendData(data: BackendTrendResponse): TrendItem | null {
  const trend = data.trend;
  if (!trend || trend.length === 0) return null;
  const keyword = data.seller.keyword || trend[0].keyword;
  const ratios = trend.map(d => d.ratio);
  return {
    keyword,
    latestRatio: ratios[ratios.length - 1],
    peakRatio: Math.max(...ratios),
    avgRatio: parseFloat((ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(1)),
    dataPoints: trend,
    sellerCount: data.seller.sellerCount,
    sellerLevel: data.seller.sellerLevel,
    potential: data.seller.potential,
  };
}

/**
 * 백엔드 `/api/trends` 엔드포인트를 호출하는 React Query 훅
 * @param keyword - 검색할 키워드
 * @param period - 조회 기간 (기본값: 7일)
 */
export function useTrendingKeywords(keyword: string = '', period: number = 7) {
  return useQuery<TrendItem | null, Error>({
    queryKey: ['trendingKeywords', keyword, period],
    queryFn: async () => {
      if (!keyword || !keyword.trim()) {
        return null;
      }
      try {
        const response = await apiClient.get<BackendResponse<BackendTrendResponse>>(
          '/trends',
          { params: { keyword, period } }
        );
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.error || '데이터 로드 실패');
        }
        return aggregateTrendData(response.data.data);
      } catch (error: any) {
        console.error('Trending Keywords Error:', error);
        throw new Error(error.response?.data?.error || error.message || '네트워크 오류가 발생했습니다.');
      }
    },
    staleTime: 0,                 // 항상 최신 데이터 요청 (재검색 시 캐시 무시)
    gcTime: 1000 * 60 * 60 * 24, // 24시간 (메모리에서 유지)
    retry: 2,
    enabled: !!keyword,           // keyword가 존재할 때만 요청
  });
}

/**
 * 추천 아이템 조회 훅 (수동 호출)
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
    enabled: false,  // 수동으로 호출할 때만 실행
  });
}
