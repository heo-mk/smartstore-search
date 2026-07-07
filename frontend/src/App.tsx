import { useState } from 'react';
import { useRecommendedItems } from './api/queries';
import { SearchBar } from './components/SearchBar';
import { TrendingList } from './components/TrendingList';
import { RecommendedList } from './components/RecommendedList';
import { ItemDetails } from './components/ItemDetails';
import { FavoritePanel } from './components/FavoritePanel';
import type { LocalItem } from './types';
import './App.scss';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<LocalItem | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);
  
  // 추천 아이템 쿼리 (수동 호출)
  const { 
    data: recommendedItems = [], 
    isLoading: isRecommendLoading,
    error: recommendError,
    refetch: refetchRecommendations 
  } = useRecommendedItems();

  // 추천 버튼 클릭 핸들러
  const handleRecommendClick = async () => {
    setShowRecommended(true);
    setSearchTerm('');
    await refetchRecommendations();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-icon">📈</span>
            <h1>smartstore-item-finder</h1>
          </div>
          <p className="header-tagline">네이버 데이터랩 API 기반 검색 트렌드 분석 & 아이템 발굴 도구</p>
        </div>
      </header>

      <main className="app-main">
        <div className="workspace-layout">
          {/* 좌측: 검색 및 아이템 분석 목록 */}
          <div className="workspace-column left-column">
            <section className="search-section">
              <SearchBar onSearch={setSearchTerm} />
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
                    items={recommendedItems}
                    isLoading={isRecommendLoading}
                    error={recommendError}
                    onSelectItem={setSelectedItem}
                  />
                </>
              ) : (
                <TrendingList
                  searchTerm={searchTerm}
                  onSelectItem={setSelectedItem}
                  onRecommendClick={handleRecommendClick}
                  isRecommendLoading={isRecommendLoading}
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
    </div>
  );
}

