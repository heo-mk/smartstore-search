// 백엔드에서 받아올 네이버 데이터랩 트렌드 데이터 구조 (날짜별 1행)
export interface NaverTrendItem {
  date: string;
  ratio: number;
  keyword: string;
}

// 검색어의 트렌드 요약 (여러 날짜를 하나로 집계)
export interface TrendItem {
  keyword: string;
  latestRatio: number;   // 가장 최근 날짜의 검색 비율 (0~100)
  peakRatio: number;     // 기간 내 최고 비율
  avgRatio: number;      // 기간 내 평균 비율
  dataPoints: NaverTrendItem[]; // 날짜별 원본 데이터
  sellerCount?: number;
  sellerLevel?: string;
  potential?: string;
}

// 찜한 아이템 저장 구조 (API 기반으로 전환)
export interface FavoriteItem {
  keyword: string;       // 검색 키워드
  latestRatio: number;
  sellerCount?: number;
  sellerLevel?: string;
  potential?: string;
  addedAt: string;       // ISO 8601 형식 날짜
}

// 백엔드 API 응답 구조
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}
