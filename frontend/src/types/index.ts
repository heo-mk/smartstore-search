// 백엔드에서 받아올 구글 트렌드 데이터 구조
export interface TrendingKeyword {
  keyword: string;
  traffic: string;         // "12K+" 형식의 문자열
  trendingScore: number;   // 0~100의 정수
  exploreLink: string;     // 자세히 보기 링크
}

// 백엔드에서 받아올 실제 네이버 데이터랩 트렌드 데이터 구조
export interface NaverTrendItem {
  date: string;
  ratio: number;
  keyword: string;
}

// 로컬 데이터셋의 아이템 구조
export interface LocalItem {
  id: number;
  category: string;        // 예: "뷰티", "패션", "생활용품"
  name: string;           // 아이템 이름
  difficulty: "낮음" | "중간" | "높음";        // 진입 난이도
  profitability: "낮음" | "중간" | "높음";     // 수익성
  competition: "낮음" | "중간" | "높음";       // 경쟁 수준
  rating: number;         // 1~5 별점
}

// 찜한 아이템 저장 구조
export interface Favorite {
  itemId: number;
  addedAt: string;        // ISO 8601 형식 날짜
}

// 백엔드 API 응답 구조
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}
