const axios = require('axios');

// 배열을 n개씩 묶어주는 헬퍼 함수
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const NAVER_DATALAB_URL = 'https://openapi.naver.com/v1/datalab/search';
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
    const errorMsg = error.response && error.response.data
      ? (error.response.data.errorMessage || error.response.data.message || error.message)
      : error.message;
    console.error('Naver DataLab API Error:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * 여러 키워드의 검색 트렌드를 조회하여 최근 검색비율 기준 추천 아이템 반환
 * @param {Array<string>} keywords - 조회할 키워드 배열
 * @returns {Promise<Array>} 추천 아이템 배열 (keyword, searchTrend), 검색비율 내림차순
 */
async function getRecommendedItems(keywords) {
  try {
    // 5개씩 묶어서 트렌드 동시 조회
    const keywordChunks = chunk(keywords, 5);
    const trendResults = [];

    for (const kwGroup of keywordChunks) {
      const groupResults = await Promise.all(
        kwGroup.map(async (kw) => {
          console.log(`[Trends] Fetching keyword: ${kw}`);
          try {
            return await getTrendingKeywords(kw, 7);
          } catch (error) {
            console.warn(`[Trends Warning] Failed for "${kw}":`, error.message);
            return [];
          }
        })
      );

      groupResults.forEach(trend => trendResults.push(trend));

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // 가장 최근 날짜의 ratio를 검색 트렌드 값으로 사용
    const recommendedItems = keywords.map((keyword, idx) => {
      const trendData = trendResults[idx];
      const latestRatio = trendData && trendData.length > 0
        ? trendData[trendData.length - 1].ratio
        : 0;

      return {
        keyword: keyword,
        searchTrend: latestRatio // 0~100, 높을수록 인기
      };
    });

    // 검색 트렌드 기준으로 정렬 (내림차순)
    return recommendedItems.sort((a, b) => b.searchTrend - a.searchTrend);
  } catch (error) {
    console.error('getRecommendedItems Error:', error);
    throw new Error('추천 아이템 생성 실패: ' + error.message);
  }
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
  getRecommendedItems
};