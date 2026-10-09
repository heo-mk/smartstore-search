# smartstore-item-finder

* **프론트엔드 배포 사이트:** [https://niche-item-finder.vercel.app/](https://niche-item-finder.vercel.app/)
* **백엔드 배포 사이트:** [https://niche-item-finder-api.vercel.app/](https://niche-item-finder-api.vercel.app/)

네이버 데이터랩 API 기반 검색 트렌드 분석 & 아이템 발굴 도구

네이버 스마트스토어 셀러를 위한 검색 트렌드 기반 아이템 발굴 도구입니다. 키워드를 입력하면 최근 7일간의 검색 트렌드를 조회하고, 시드 키워드 중 최근 검색비율이 높은 아이템을 순위로 보여줍니다.

---

<img width="1288" height="1339" alt="01" src="https://github.com/user-attachments/assets/bc6e5376-911e-4e5f-aff9-190e1db6bc22" />
<img width="1248" height="1339" alt="02" src="https://github.com/user-attachments/assets/861ddef6-e4cf-4f39-a65b-ecee4c9557b3" />
<img width="1300" height="1345" alt="03" src="https://github.com/user-attachments/assets/487c3805-4651-4a3f-a025-3b77d5bc5c90" />
<img width="1231" height="1341" alt="04" src="https://github.com/user-attachments/assets/ee452658-9cb4-4d18-9583-79b1a563b793" />
<img width="434" height="955" alt="05" src="https://github.com/user-attachments/assets/25f60bbe-1b78-46eb-b45c-fdf57ebee740" />
<img width="433" height="952" alt="06" src="https://github.com/user-attachments/assets/019cdc34-9105-4959-a3c7-38ccee87d9c0" />
<img width="434" height="954" alt="07" src="https://github.com/user-attachments/assets/eb9122c7-2694-4f15-a381-5efbe68786b8" />

## 주요 기능

- **키워드 검색**: 검색어를 입력하면 최근 7일간의 네이버 검색 트렌드를 조회합니다

- **상세 분석 리포트**: 최근 검색비율과 일자별 트렌드 차트를 보여줍니다

- **자동 아이템 추천 ("최고의 아이템 찾기")**: 20개 시드 키워드를 자동 분석해 최근 검색비율 상위 10개를 순위로 보여줍니다

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

- 네이버 데이터랩 Search API 연동

- DB 없음 (순수 API 프록시 서버)

---

## 왜 백엔드를 거치나요?

프론트엔드가 네이버 API를 직접 호출하지 않고 Express 백엔드를 경유하도록 설계했습니다.

- 네이버 API 인증키(Client ID/Secret)를 브라우저에 노출하지 않기 위해서입니다

- 네이버 API 서버의 CORS 정책상 브라우저에서의 직접 호출에 제약이 있습니다

- 시드 키워드별 트렌드 조회와 추천 순위 계산 로직을 백엔드에 집중시켜, 프론트엔드는 렌더링에만 집중하도록 역할을 분리했습니다

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

> 네이버 오픈 API 키는 [네이버 개발자센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록 후 발급받을 수 있습니다. 검색(데이터랩) API 사용 권한이 필요합니다.

### 3. 백엔드 실행

```bash
cd backend
pnpm install
pnpm dev
```

기본적으로 `http://localhost:5000`에서 실행됩니다.

### 4. 프론트엔드 실행

```bash
cd frontend
pnpm install
pnpm dev
```

기본적으로 `http://localhost:3000`에서 실행됩니다.

---

## 스크린샷

📸 *초기 화면, 키워드 검색 결과, 상세 분석 리포트, 자동 아이템 추천 스크린샷 삽입*

---

## 변경 이력

원래 목표는 수요 대비 경쟁이 적은 아이템을 찾는 것이었고, 네이버 쇼핑 검색 API로 조회한 상품 수를 경쟁도 지표로 사용했습니다. 그러나 네이버 쇼핑 검색 API가 2026-07-31 종료되어(네이버 개발자센터 공지 2026-06-29, https://developers.naver.com/notice/article/32530) 경쟁도 지표를 제거하고, 데이터랩 검색 트렌드 기반 추천 도구로 변경했습니다.

---

## 알려진 제약사항

- 배포는 Vercel(프론트엔드·백엔드 각각)에서 이루어지며, Dockerfile·CI 등 별도 배포 자동화 설정은 없습니다

- CORS 허용 origin이 `http://localhost:3000`과 `https://niche-item-finder.vercel.app`으로 코드에 고정되어 있어 다른 도메인에서 쓰려면 수정이 필요합니다. API baseURL은 `VITE_API_URL` 환경변수로 지정하며, 없으면 `http://localhost:5000/api`를 사용합니다

- 자동화 테스트는 아직 작성되어 있지 않습니다
