const axios = require('axios');

const NAVER_DATALAB_URL = 'https://openapi.naver.com/v1/datalab/search';
const NAVER_SHOPPING_URL = 'https://openapi.naver.com/v1/search/shop.json';
const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

/**
 * 네이버 데이터랩에서 특정 키워드의 검색 트렌드 조회
 * @param {string} keyword - 검색할 키워드
 * @param {number} period - 조회 기간 (기본값: 7일)
 * @returns {Promise<Array>} 트렌드 데이터 배열
 */
async function getTrendingKeywords(keyword, period = 7) {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID === 'your_naver_client_id_here' || CLIENT_SECRET === 'your_naver_client_secret_here') {
    throw new Error('Naver API credentials are missing or placeholder.');
  }

  try {
    // 요청 바디 생성
    const requestBody = {
      startDate: getDateBefore(period),
      endDate: getDateToday(),
      timeUnit: 'date',
      keywordGroups: [
        {
          groupName: keyword,
          keywords: [keyword]
        }
      ]
    };

    // 네이버 데이터랩 API 요청 (타임아웃 2초 적용)
    const response = await axios.post(NAVER_DATALAB_URL, requestBody, {
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    // 응답 데이터 정제
    const results = response.data.results[0];

    if (!results || !results.data) {
      throw new Error('네이버 데이터랩에서 데이터를 찾을 수 없습니다.');
    }

    return results.data.map(item => ({
      date: item.period,
      ratio: item.ratio,
      keyword: keyword
    }));
  } catch (error) {
    const errorMsg = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
    console.error('Naver DataLab API Error:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * 네이버 쇼핑 API에서 특정 키워드의 판매자(상품) 수 조회
 * @param {string} keyword - 검색할 키워드
 * @returns {Promise<Object>} 판매자 정보 객체
 */
async function getSellerCount(keyword) {
  if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID === 'your_naver_client_id_here' || CLIENT_SECRET === 'your_naver_client_secret_here') {
    throw new Error('Naver API credentials are missing or placeholder.');
  }

  try {
    // 네이버 쇼핑 API 요청 (타임아웃 2초 적용)
    const response = await axios.get(NAVER_SHOPPING_URL, {
      params: {
        query: keyword,
        display: 1, // 최소 개수 조회 (속도 개선)
        sort: 'sim' // 정확도 순 정렬
      },
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      },
      timeout: 5000
    });

    const total = response.data.total || 0;

    return {
      keyword: keyword,
      sellerCount: total,
      sellerLevel: getSellerLevel(total) // "매우 적음", "적음", "보통", "많음", "매우 많음"
    };
  } catch (error) {
    const errorMsg = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : error.message;
    console.error('Naver Shopping API Error:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * 여러 키워드의 트렌드 + 판매자 수를 결합하여 추천 아이템 반환
 * @param {Array<string>} keywords - 조회할 키워드 배열
 * @returns {Promise<Array>} 추천 아이템 배열 (트렌드 점수 + 판매자 수 조합)
 */
async function getRecommendedItems(keywords) {
  try {
    // 1단계: 모든 키워드의 트렌드 데이터 순차 조회 (레이트 리밋 방지)
    const trendResults = [];
    for (const kw of keywords) {
      console.log(`[Trends] Fetching keyword: ${kw}`);
      const trend = await getTrendingKeywords(kw, 7);
      trendResults.push(trend);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 2단계: 모든 키워드의 판매자 수 순차 조회 (레이트 리밋 방지)
    const sellerResults = [];
    for (const kw of keywords) {
      console.log(`[Seller Count] Fetching keyword: ${kw}`);
      const seller = await getSellerCount(kw);
      sellerResults.push(seller);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3단계: 트렌드 + 판매자 수 결합
    const recommendedItems = keywords.map((keyword, idx) => {
      // 트렌드 데이터에서 가장 최근의 ratio 값 추출
      const trendData = trendResults[idx];
      const latestRatio = trendData && trendData.length > 0
        ? trendData[trendData.length - 1].ratio
        : 0;

      // 판매자 데이터
      const sellerData = sellerResults[idx];
      const sellerCount = sellerData ? sellerData.sellerCount : 0;
      const sellerLevel = sellerData ? sellerData.sellerLevel : '보통';

      // 추천 점수 계산: (트렌드 비율 * 0.6) + (판매자수 역으로 * 0.4)
      // 판매자가 적을수록 높은 점수
      const sellerScore = Math.max(0, Math.min(100,
        100 * (1 - sellerCount / 5000000)
      ));
      const recommendationScore = (latestRatio * 0.6) + (sellerScore * 0.4);

      return {
        keyword: keyword,
        searchTrend: latestRatio,           // 0~100, 높을수록 인기
        sellerCount: sellerCount,           // 판매자 수
        sellerLevel: sellerLevel,           // "매우 적음" ~ "매우 많음"
        recommendationScore: parseFloat(recommendationScore.toFixed(2)), // 추천 점수
        potential: getPotentialLevel(latestRatio, sellerCount) // "매우 높음" ~ "낮음"
      };
    });

    // 판매자 수가 '많음' 또는 '매우 많음'인 경쟁이 치열한 상품은 제외 (수요는 많고 공급은 적은 상품 추천)
    const filteredItems = recommendedItems.filter(item => 
      item.sellerLevel !== '많음' && item.sellerLevel !== '매우 많음'
    );

    // 4단계: 추천 점수 기준으로 정렬 (내림차순)
    return filteredItems.sort((a, b) => b.recommendationScore - a.recommendationScore);
  } catch (error) {
    console.error('getRecommendedItems Error:', error);
    throw new Error('추천 아이템 생성 실패: ' + error.message);
  }
}

/**
 * 판매자 수 기준으로 레벨 분류
 */
function getSellerLevel(count) {
  if (count < 150000) return '매우 적음';
  if (count < 500000) return '적음';
  if (count < 1000000) return '보통';
  if (count < 5000000) return '많음';
  return '매우 많음';
}

/**
 * 트렌드 + 판매자 수 기준으로 수익성 잠재력 평가
 */
function getPotentialLevel(trend, sellerCount) {
  // 트렌드는 높고, 판매자는 적을수록 좋음 (블루오션)
  const trendScore = trend; // 0~100
  const sellerScore = Math.max(0, 100 * (1 - sellerCount / 5000000));
  const combinedScore = (trendScore * 0.6) + (sellerScore * 0.4);

  if (combinedScore >= 70) return '매우 높음';
  if (combinedScore >= 55) return '높음';
  if (combinedScore >= 40) return '보통';
  if (combinedScore >= 25) return '낮음';
  return '매우 낮음';
}

/**
 * n일 전의 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getDateBefore(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getDateToday() {
  return new Date().toISOString().split('T')[0];
}

module.exports = {
  getTrendingKeywords,
  getSellerCount,
  getRecommendedItems,
  getSellerLevel,
  getPotentialLevel
};