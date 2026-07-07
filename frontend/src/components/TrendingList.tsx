import { useEffect } from 'react';
import { useTrendingKeywords } from '../api/queries';
import type { TrendItem } from '../types';

interface TrendingListProps {
  searchTerm: string;
  onSelectItem: (item: TrendItem) => void;
  onRecommendClick: () => void;
  isRecommendLoading: boolean;
  onRefetchReady?: (refetch: () => void) => void;
}

export function TrendingList({
  searchTerm,
  onSelectItem,
  onRecommendClick,
  isRecommendLoading,
  onRefetchReady,
}: TrendingListProps) {
  const { data: trendItem, isLoading, error, refetch } = useTrendingKeywords(searchTerm);

  // refetch 함수를 부모에 한 번만 등록
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(() => { refetch(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  // trendItem이 새로 로드되거나 변경되면 상세 보기 아이템 자동 선택
  useEffect(() => {
    if (trendItem) {
      onSelectItem(trendItem);
    }
  }, [trendItem, onSelectItem]);

  const renderContent = () => {
    // 검색어 없을 때
    if (!searchTerm) {
      return (
        <p className="no-result">
          {`검색창에 키워드를 입력하고 엔터를 누르면
네이버 데이터랩 트렌드를 조회합니다.`}
        </p>
      );
    }

    if (isLoading) {
      return <div className="loading-state">네이버 데이터랩 실시간 검색량 수집 중...</div>;
    }

    if (error) {
      return <div className="error-state">오류 발생: {error.message}</div>;
    }

    if (!trendItem) {
      return <p className="no-result">"{searchTerm}"에 대한 트렌드 데이터가 없습니다.</p>;
    }

    return (
      <div className="list-container">
        <div
          className="trending-item-card"
          onClick={() => onSelectItem(trendItem)}
        >
          <div className="item-meta">
            <span className="category-tag">검색어</span>
            <h3>{trendItem.keyword}</h3>
          </div>

          <div className="trend-stats">
            <div className="trend-badge">
              <span className="badge-title">최근 검색비율</span>
              <span className="badge-value">{trendItem.latestRatio.toFixed(1)}%</span>
            </div>
            <div className="trend-badge">
              <span className="badge-title">최고 비율</span>
              <span className="badge-value">{trendItem.peakRatio.toFixed(1)}%</span>
            </div>
            <div className="trend-badge">
              <span className="badge-title">평균 비율</span>
              <span className="badge-value">{trendItem.avgRatio.toFixed(1)}%</span>
            </div>
          </div>

          {/* 날짜별 미니 바 차트 */}
          <div className="mini-chart">
            {trendItem.dataPoints.map((point) => (
              <div key={point.date} className="bar-wrap" title={`${point.date}: ${point.ratio.toFixed(1)}%`}>
                <div
                  className="bar"
                  style={{ height: `${Math.max(4, point.ratio)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="trending-list">
      <div className="list-header">
        <h2>트렌드 분석</h2>
        <button
          className="recommend-button"
          onClick={onRecommendClick}
          disabled={isRecommendLoading}
        >
          {isRecommendLoading ? '분석 중...' : '최고의 아이템 찾기'}
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
