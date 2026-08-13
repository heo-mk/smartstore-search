# smartstore-item-finder

네이버 데이터랩 API와 네이버 쇼핑 검색 API를 활용해, 스마트스토어 셀러가 소싱할 아이템을 데이터 기반으로 발굴하는 웹 도구입니다.

검색량은 높지만 판매자 경쟁은 낮은 "블루오션 아이템"을 20개 시드 키워드 기준으로 자동 분석해, 감이 아닌 수치로 소싱 판단을 도와주는 것을 목표로 만들었습니다.

---

## 주요 기능

- **키워드 검색 및 트렌드 분석**

  키워드 입력 시 일자별 검색량 추이, 최근/최고/평균 검색비율, 판매 상품 수, 시장 경쟁도, 소싱 잠재력을 조회합니다.

- **블루오션 추천 아이템 TOP 10**

  20개 시드 키워드를 자체 추천 알고리즘으로 점수화해, 수요는 높고 경쟁은 낮은 아이템 상위 10개를 자동 추출합니다.

- **찜(즐겨찾기) 관리**

  관심 키워드를 찜하고, 브라우저 로컬 저장소에 저장해 언제든 다시 확인할 수 있습니다.

---

## 기술 스택

**프론트엔드**

- React 19, TypeScript, Vite

- 상태관리: Zustand (persist 미들웨어)

- 서버 상태: TanStack React Query v5

- HTTP: Axios

- 스타일: Sass/SCSS

**백엔드**

- Node.js, Express

- CORS, dotenv

- 외부 API: 네이버 데이터랩 API, 네이버 쇼핑 검색 API

---

## 아키텍처

프론트엔드는 네이버 오픈 API를 직접 호출하지 않고, Express 백엔드를 경유하는 BFF(Backend-For-Frontend) 구조로 되어 있습니다.

- API 인증키(`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`)를 브라우저에 노출하지 않기 위함

- 서버 간 통신으로 CORS 제약을 우회하기 위함

- 여러 외부 API 응답을 백엔드에서 취합·정규화한 뒤 프론트에 전달해, 프론트엔드는 렌더링에만 집중할 수 있도록 함

추천 점수는 `(트렌드 비율 × 0.6) + (판매자수 역점수 × 0.4)` 공식으로 계산하며, 판매자 수가 '많음' 이상인 상품은 1차 필터링으로 사전 제외합니다.

---

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/heo-mk/smartstore-search.git
cd smartstore-search
```

### 2. 백엔드 실행

```bash
cd backend
npm install
```

`backend` 폴더에 `.env` 파일을 만들고 아래 값을 입력합니다.

```
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

```bash
npm run dev
```

기본적으로 `http://localhost:5000`에서 실행됩니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

> ⚠️ 주의: 백엔드의 CORS origin이 `http://localhost:3000`으로 고정되어 있습니다. Vite 기본 포트(5173)로 실행하면 CORS 오류가 발생할 수 있으니, 프론트엔드를 3000번 포트로 실행하거나 `backend/server.js`의 CORS 설정을 수정해주세요.

---

## API 엔드포인트

| 엔드포인트 | 설명 |
|---|---|
| `GET /api/trends` | 특정 키워드의 트렌드 및 판매자 수 조회 |
| `GET /api/trends/recommended` | 20개 시드 키워드 기반 추천 아이템 TOP 10 조회 |

---

## 알려진 제약사항

- 별도 DB가 없어 찜 목록은 브라우저 로컬 저장소에만 저장됩니다.

- 배포 환경 설정(Dockerfile, CI 등)은 아직 없으며, 로컬 실행 전용입니다.

- 테스트 코드는 작성되어 있지 않습니다.

---

## 개발 기간

2026.07.07 – 2026.07.11 (개인 프로젝트, 기획부터 프론트엔드·백엔드 전체 단독 개발)
