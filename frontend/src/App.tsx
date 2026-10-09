import { useState, useRef, useCallback, useEffect } from 'react';
import { useRecommendedItems } from './api/queries';
import { SearchBar } from './components/SearchBar';
import { TrendingList } from './components/TrendingList';
import { RecommendedList } from './components/RecommendedList';
import { ItemDetails } from './components/ItemDetails';
import { FavoritePanel } from './components/FavoritePanel';
import { WarningModal } from './components/WarningModal';
import type { NaverTrendItem } from './types';
import './App.scss';

interface SelectedItem {
  keyword: string;
  latestRatio?: number;
  dataPoints?: NaverTrendItem[];
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [showCachedNotice, setShowCachedNotice] = useState(false);
  const cachedNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TrendingList 내부의 refetch 함수를 저장하는 ref
  const trendingRefetchRef = useRef<(() => void) | null>(null);

  // TrendingList가 refetch 함수를 준비하면 ref에 저장
  const handleRefetchReady = useCallback((refetch: () => void) => {
    trendingRefetchRef.current = refetch;
  }, []);

  // 추천 아이템 쿼리 (수동 호출)
  const { 
    data: recommended, 
    isLoading: isRecommendLoading,
    isFetching: isRecommendFetching,
    isStale: isRecommendStale,
    dataUpdatedAt: recommendUpdatedAt,
    error: recommendError,
    refetch: refetchRecommendations 
  } = useRecommendedItems();

  // 검색 핸들러: searchTerm 업데이트 및 중복/빈 키워드 제어
  const handleSearch = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setShowRecommended(false);

    if (trimmed === searchTerm) {
      // 동일 키워드 재검색 시에만 refetch 강제 호출
      trendingRefetchRef.current?.();
    } else {
      // 새로운 키워드는 상태 업데이트 -> React Query가 queryKey 변경 감지하여 자동 fetch
      setSearchTerm(trimmed);
    }
  }, [searchTerm]);

  // 추천 버튼 클릭 핸들러
  const handleRecommendClick = async () => {
    // 조회 중에는 요청하지 않고 경고 모달 표시
    if (isRecommendFetching) {
      setShowBusyModal(true);
      return;
    }
    setShowRecommended(true);
    setSearchTerm('');
    // 보관된 결과가 신선하면(staleTime 이내) 요청 없이 그대로 사용
    if (recommended && !isRecommendStale) {
      // 안내 문구를 3초간 표시 (재클릭 시 타이머 재시작)
      if (cachedNoticeTimerRef.current) clearTimeout(cachedNoticeTimerRef.current);
      setShowCachedNotice(true);
      cachedNoticeTimerRef.current = setTimeout(() => setShowCachedNotice(false), 3000);
      return;
    }
    await refetchRecommendations();
  };

  // 언마운트 시 안내 문구 타이머 정리
  useEffect(() => () => {
    if (cachedNoticeTimerRef.current) clearTimeout(cachedNoticeTimerRef.current);
  }, []);

  const closeBusyModal = useCallback(() => setShowBusyModal(false), []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-icon">📈</span>
            <h1>smartstore-item-finder</h1>
          </div>
          <p className="header-tagline">네이버 데이터랩 API 기반 검색 트렌드 분석 &amp; 아이템 발굴 도구</p>
        </div>
      </header>

      <main className="app-main">
        <div className="workspace-layout">
          {/* 좌측: 검색 및 아이템 분석 목록 */}
          <div className="workspace-column left-column">
            <section className="search-section">
              <SearchBar onSearch={handleSearch} />
              <div className="button-group">
                <button
                  className="recommend-button"
                  onClick={handleRecommendClick}
                  aria-disabled={isRecommendFetching}
                >
                  {isRecommendFetching && <span className="button-spinner" aria-hidden="true" />}
                  {isRecommendFetching ? '분석 중...' : '🌟 아이템 추천 받기'}
                </button>
                {showCachedNotice && (
                  <p className="recommend-notice" role="status">
                    1시간 안에 조회한 결과입니다.
                  </p>
                )}
              </div>
            </section>
            
            <section className="list-section">
              {showRecommended ? (
                <>
                  <button 
                    className="back-button"
                    onClick={() => setShowRecommended(false)}
                  >
                    ← 뒤로 가기
                  </button>
                  <RecommendedList
                    items={recommended?.items ?? []}
                    totalCount={recommended?.totalCount}
                    analyzedCount={recommended?.analyzedCount}
                    updatedAt={recommendUpdatedAt}
                    isLoading={isRecommendLoading}
                    error={recommendError}
                    onSelectItem={setSelectedItem}
                  />
                </>
              ) : (
                <TrendingList
                  searchTerm={searchTerm}
                  onSelectItem={setSelectedItem}
                  onRefetchReady={handleRefetchReady}
                />
              )}
            </section>
          </div>

          {/* 중앙: 상세 분석 보고서 */}
          <div className="workspace-column center-column">
            <section className="detail-section">
              <ItemDetails item={selectedItem} />
            </section>
          </div>

          {/* 우측: 찜 목록 사이드바 */}
          <div className="workspace-column right-column">
            <aside className="favorite-section">
              <FavoritePanel onSelectItem={setSelectedItem} />
            </aside>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 smartstore-item-finder MVP. Powered by Naver DataLab API.</p>
      </footer>

      {showBusyModal && (
        <WarningModal
          message="추천 조회 중입니다. 완료될 때까지 기다려 주세요."
          onClose={closeBusyModal}
        />
      )}
    </div>
  );
}
