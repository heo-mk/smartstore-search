const express = require('express');
const router = express.Router();
const { 
  getTrendingKeywords, 
  getRecommendedItems, 
  getSellerCount, 
  getPotentialLevel 
} = require('../services/naver');

// 추천 아이템 분석에 사용할 실시간 인기 이커머스 카테고리/아이템 시드 키워드
const SEED_KEYWORDS = [
  'BB크림', '린넨 셔츠', '무선 충전기', '에센스', '에코백', 
  '텀블러', '블루투스 스피커', '립스틱', '향초', '양말', 
  '스마트워치', '수건', '캠핑의자', '가습기', '영양제',
  '요가매트', '무선이어폰', '그립톡', '휴대용 선풍기', '슬리퍼'
];

/**
 * GET /api/trends
 * 네이버 데이터랩 트렌드 및 쇼핑 판매자 수 통합 조회
 * 쿼리: keyword (필수), period (선택, 기본값: '7')
 */
router.get('/', async (req, res) => {
  try {
    const { keyword = '', period = '7' } = req.query;
    const periodDays = parseInt(period, 10) || 7;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '검색어가 필요합니다.'
      });
    }
    
    // 트렌드와 쇼핑 판매자 수 정보 병합 조회
    const [trendData, sellerData] = await Promise.all([
      getTrendingKeywords(keyword, periodDays),
      getSellerCount(keyword).catch(err => {
        console.warn(`[Trends API Warning] Failed to fetch seller count for "${keyword}":`, err.message);
        return {
          keyword,
          sellerCount: 0,
          sellerLevel: '알 수 없음'
        };
      })
    ]);

    const latestRatio = trendData && trendData.length > 0 ? trendData[trendData.length - 1].ratio : 0;
    const potential = getPotentialLevel(latestRatio, sellerData.sellerCount);

    res.json({
      success: true,
      data: {
        trend: trendData,
        seller: {
          ...sellerData,
          potential
        }
      },
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
 */
router.get('/recommended', async (req, res) => {
  try {
    console.log(`📊 추천 아이템 조회 시작: ${SEED_KEYWORDS.length}개 시드 키워드`);

    // 모든 시드 아이템의 트렌드 + 판매자 수 데이터 조회 및 정렬
    const recommendedItems = await getRecommendedItems(SEED_KEYWORDS);

    // 추천 점수 상위 10개 선택 (과도한 API 호출 방지 및 고품질 추천 필터링)
    const topRecommendations = recommendedItems.slice(0, 10);

    res.json({
      success: true,
      data: topRecommendations,
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