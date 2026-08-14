# smartstore-item-finder

네이버 데이터랩 API 기반 검색 트렌드 분석 & 아이템 발굴 도구

네이버 스마트스토어 셀러를 위한 데이터 기반 아이템 발굴 도구입니다. 키워드를 입력하면 최근 7일간의 검색 트렌드와 판매 경쟁 강도를 함께 조회하고, 두 지표를 가중 합산한 추천 점수로 "인기는 높지만 경쟁은 적은" 아이템을 순위로 보여줍니다.

---

<img width="1203" height="1313" alt="스크린샷 2026-08-14 032658" src="https://github.com/user-attachments/assets/d134b955-5396-468f-91e0-53b50cde5c3a" />
<img width="1209" height="1305" alt="스크린샷 2026-08-14 032710" src="https://github.com/user-attachments/assets/afb5f582-12d4-4d50-a2df-7c77797bcb2e" />
<img width="1177" height="1305" alt="스크린샷 2026-08-14 032732" src="https://github.com/user-attachments/assets/0ab12cb1-1485-41ec-9943-a825f81be4ce" />

## 주요 기능

- **키워드 검색**: 검색어를 입력하면 최근 7일간의 네이버 검색 트렌드를 조회합니다

- **상세 분석 리포트**: 검색비율, 시장 경쟁도, 판매 상품 수, 소싱 잠재력 4개 지표와 일자별 트렌드 차트를 보여줍니다

- **자동 아이템 추천 ("최고의 아이템 찾기")**: 20개 시드 키워드를 자동 분석해 추천 점수 상위 10개를 순위로 보여줍니다

- **찜하기**: 관심 있는 키워드를 저장해 재방문 시에도 유지합니다

---

## 기술 스택

### Frontend

- React 19 + TypeScript

- Vite

- TanStack React Query (서버 상태 관리)

- Zustand (클라이언트 상태 관리, 찜 목록 persist)

- Axios, SCSS

### Backend

- Express

- 네이버 데이터랩 Search API, 네이버 쇼핑 Search API 연동

- DB 없음 (순수 API 프록시 서버)

---

## 왜 백엔드를 거치나요?

프론트엔드가 네이버 API를 직접 호출하지 않고 Express 백엔드를 경유하도록 설계했습니다.

- 네이버 API 인증키(Client ID/Secret)를 브라우저에 노출하지 않기 위해서입니다

- 네이버 API 서버의 CORS 정책상 브라우저에서의 직접 호출에 제약이 있습니다

- 트렌드 API와 쇼핑 API 두 응답을 조합해 추천 점수를 계산하는 로직을 백엔드에 집중시켜, 프론트엔드는 렌더링에만 집중하도록 역할을 분리했습니다

---

## 왜 React Query와 Zustand를 함께 쓰나요?

데이터의 성격에 따라 상태 관리 도구를 분리했습니다.

- 트렌드·추천 데이터는 API 응답에 따라 갱신되는 서버 상태이므로 React Query로 관리합니다

- 찜 목록은 사용자가 명시적으로 조작할 때만 바뀌는 클라이언트 상태이므로 Zustand로 분리했습니다

- 찜 목록은 새로고침 후에도 유지되어야 하므로 `persist` 미들웨어로 localStorage에 자동 저장합니다

---

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/heo-mk/smartstore-search.git
cd smartstore-search
```

### 2. 환경변수 설정

`backend` 폴더에 `.env` 파일을 만들고 네이버 개발자센터에서 발급받은 API 키를 입력합니다.

```
NAVER_CLIENT_ID=발급받은_client_id
NAVER_CLIENT_SECRET=발급받은_client_secret
```

> 네이버 오픈 API 키는 [네이버 개발자센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록 후 발급받을 수 있습니다. 검색(데이터랩), 검색(쇼핑) 두 API 사용 권한이 필요합니다.

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

기본적으로 `http://localhost:5000`에서 실행됩니다.

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

기본적으로 `http://localhost:3000`에서 실행됩니다.

---

## 스크린샷

📸 *초기 화면, 키워드 검색 결과, 상세 분석 리포트, 자동 아이템 추천 스크린샷 삽입*

---

## 알려진 제약사항

- 배포 설정(Dockerfile, CI 등) 없음 — 로컬 실행만 가능합니다

- CORS 허용 origin, API baseURL이 `localhost` 기준으로 하드코딩되어 있어 배포 시 별도 수정이 필요합니다

- 자동화 테스트는 아직 작성되어 있지 않습니다
