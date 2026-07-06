const express = require('express');
const router = express.Router();
const { getTrendingKeywords, getRecommendedItems } = require('../services/naver');

// 프론트엔드에서 사용할 로컬 아이템 데이터
const items = require('../data/items.json');

/**
 * GET /api/trends
 * 네이버 데이터랩 트렌드 데이터 조회
 * 쿼리: keyword (필수), period (선택, 기본값: '7')
 */
router.get('/', async (req, res) => {
  try {
    const { keyword = '스마트스토어', period = '7' } = req.query;
    const periodDays = parseInt(period, 10) || 7;
    const data = await getTrendingKeywords(keyword, periodDays);
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trends API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/trends/recommended
 * 추천 아이템 조회 (검색 트렌드 높음 + 판매자 적음)
 * 
 * 로직:
 * 1. 로컬 데이터의 모든 아이템 이름으로 트렌드 조회
 * 2. 각 아이템의 판매자 수 조회
 * 3. 추천 점수(트렌드 + 판매자 수 역)로 정렬
 * 4. 상위 5개 반환
 */
router.get('/recommended', async (req, res) => {
  try {
    // 1단계: 로컬 데이터에서 모든 아이템 이름 추출
    const allItemNames = items.map(item => item.name);

    if (allItemNames.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: '로컬 아이템 데이터가 없습니다.'
      });
    }

    console.log(`📊 추천 아이템 조회 시작: ${allItemNames.length}개 키워드`);

    // 2단계: 모든 아이템의 트렌드 + 판매자 수 데이터 조회 및 정렬
    const recommendedItems = await getRecommendedItems(allItemNames);

    // 3단계: 추천 점수 상위 20개 선택
    const topRecommendations = recommendedItems.slice(0, 20);

    // 4단계: 로컬 아이템 정보와 병합
    const resultWithDetails = topRecommendations.map(recommended => {
      const localItem = items.find(item => item.name === recommended.keyword);
      return {
        ...recommended,
        localDetails: localItem || null
      };
    });

    res.json({
      success: true,
      data: resultWithDetails,
      totalCount: recommendedItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recommended API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;