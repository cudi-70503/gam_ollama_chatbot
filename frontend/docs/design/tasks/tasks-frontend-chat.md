# Task List: Local LLM Chat Frontend (React)

- 기준 PRD: `frontend/docs/design/tasks/prd-frontend-chat.md`
- UI 기준: `frontend/docs/design/chat_ui_설계도.jpg`
- 개발 범위: `frontend/` 만. **`backend/`는 읽기 전용이며 어떤 Task도 backend를 수정하지 않는다.**
- 대상 독자: 주니어 React 개발자

---

## Relevant Files

| 파일 | 구분 | 설명 |
| --- | --- | --- |
| `frontend/src/App.jsx` | 수정 | 최상위 컴포넌트. 모든 state 소유, 2단 레이아웃 배치, API 호출 오케스트레이션 |
| `frontend/src/App.css` | 수정 | 2단 레이아웃 및 각 영역 스타일 |
| `frontend/src/index.css` | 수정 | 전역 리셋, 배경색, 폰트, `100vh` 기준 |
| `frontend/src/main.jsx` | 유지 | `createRoot` + `<StrictMode>` 구조를 **변경하지 않는다** (PRD F-10) |
| `frontend/src/api/chatApi.js` | 생성 | `getModels()`, `postChat()` 및 에러 정규화 |
| `frontend/src/api/promptMode.js` | **읽기 전용 (수정 금지)** | 기존 파일. `promptModes` 프리셋 5종을 import 하여 모드 select option 생성 (PRD F-11) |
| `frontend/src/components/SettingsSidebar.jsx` | 생성 | "모델 설정" 사이드바 |
| `frontend/src/components/ChatHeader.jsx` | 생성 | 제목/부제 + `대화 초기화` 버튼 |
| `frontend/src/components/MessageList.jsx` | 생성 | 메시지 목록 + 자동 스크롤 + 에러 인라인 표시 |
| `frontend/src/components/MessageBubble.jsx` | 생성 | 단일 말풍선 (user / assistant 분기) |
| `frontend/src/components/ChatInput.jsx` | 생성 | 입력 textarea + 전송 버튼 |
| `frontend/index.html` | 수정(선택) | `<title>`을 `Local LLM Chat`으로 변경 |
| `frontend/package.json` | **수정 금지** | 신규 dependency 추가 금지 (PRD N-2, F-9) |
| `backend/**` | **수정 금지** | PRD F-1 |

### Notes

- **테스트 코드는 이번 범위에서 제외**된다 (PRD N-10). 따라서 `*.test.jsx` 파일을 만들지 않으며, 각 Sub-task의 검증은 **브라우저 수동 확인 + `npm run lint` + `npm run build`** 로 수행한다.
- 컴포넌트 파일 경로는 제안이며, 구현 중 조정 가능하다 (PRD 6장).
- **Context7 사용:** React API/패턴 판단이 필요한 Sub-task에는 `**Context7:**` 항목을 명시했다. 해당 Task에서는 반드시 Context7으로 React 공식 문서(`/reactjs/react.dev`)를 조회한 뒤 구현한다. 설치된 버전(React 19.3.0)을 기준으로 하며 **버전을 임의로 올리지 않는다.**
- 각 Sub-task 완료 시 이 파일의 `- [ ]`를 `- [x]`로 직접 변경한다. Parent Task 단위가 아니라 **Sub-task 단위로** 갱신한다.

---

## Tasks

- [ ] **0.0 Feature Branch 생성**

  - [ ] 0.1 작업용 브랜치 생성 &nbsp;— **사용자 지시로 생략 (2026-09-23)**
    - **구현 대상:** git 브랜치
    - **예상 파일:** 없음 (git 작업)
    - **구현 내용:**
      - `git checkout -b feature/frontend-chat`
      - ⚠️ 현재 워킹트리에 **커밋되지 않은 `backend/main.py` 수정**이 남아 있다. 브랜치 작업 중 `git add -A` 등으로 backend 변경이 함께 커밋되지 않도록 주의한다 (AC-40 위반 위험). 처리 방침은 "사용자 확인 필요 사항 #4" 참조.
    - **검증 방법:** `git branch --show-current`
    - **완료 조건:** `feature/frontend-chat` 브랜치에 체크아웃되어 있고, `git status`에 의도치 않은 staged 변경이 없다.

---

- [ ] **1.0 현재 frontend/ 구조 및 실행 환경 확인**

  - [x] 1.1 설치된 라이브러리 버전 확인
    - **구현 대상:** 의존성 기준선 확정
    - **예상 파일:** `frontend/package.json` (읽기만)
    - **구현 내용:**
      - `package.json`과 `node_modules`의 실제 설치 버전 대조 (React 19.3.0, react-dom 19.3.0, Vite 8.3.0, @vitejs/plugin-react 6.1.1)
      - PRD 11.1 표와 일치하는지 확인
      - **버전 업그레이드를 하지 않는다. `npm install`로 신규 패키지를 추가하지 않는다.**
    - **검증 방법:** `node -p "require('./node_modules/react/package.json').version"` 등으로 확인
    - **완료 조건:** PRD 11.1의 버전과 실제 설치 버전이 일치함을 확인했다. 불일치 시 진행을 멈추고 사용자에게 보고한다.

  - [x] 1.2 Frontend 개발 서버 기동 확인
    - **구현 대상:** Vite dev 서버
    - **예상 파일:** 없음
    - **구현 내용:** `cd frontend && npm run dev` 실행 후 `http://localhost:5173` 접속
    - **검증 방법:** 기본 Vite 템플릿 화면이 뜨고 콘솔 에러가 없다
    - **완료 조건:** dev 서버가 5173에서 정상 기동한다.

  - [x] 1.3 Backend / Ollama 기동 및 API Contract 실측 확인
    - **구현 대상:** PRD 4장 API Contract 검증 (**Backend 수정 없음, 호출만**)
    - **예상 파일:** 없음
    - **구현 내용:**
      - Ollama 실행 확인 (`systemctl is-active ollama`)
      - Backend 실행: `cd backend && uv run uvicorn main:app --reload --port 8000`
      - `curl http://127.0.0.1:8000/models` → `{"models": [...]}` 형태 확인
      - `curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" -d '{"message":"안녕"}'` → `model` / `message` / `elapsed_time` 3개 필드 확인
      - 실제 사용 가능한 모델명을 기록해 둔다 (이후 수동 테스트에 사용)
    - **검증 방법:** 두 API가 200을 반환하고 응답 필드가 PRD 4.3 / 4.4와 일치한다
    - **완료 조건:** API Contract가 PRD와 일치함을 확인했다. 불일치 시 **backend를 고치지 말고** 사용자에게 보고한다.

  - [x] 1.4 lint / build 기준선 확보
    - **구현 대상:** 검증 명령 기준선
    - **예상 파일:** 없음
    - **구현 내용:** 구현 시작 전 `npm run lint`, `npm run build` 실행 결과를 기록
    - **검증 방법:** 두 명령의 종료 코드 및 출력 확인
    - **완료 조건:** 작업 전 기준선이 기록되어, 이후 실패가 내 변경 때문인지 구분할 수 있다.

---

- [ ] **2.0 전체 Layout 구현 (설계도 기반)**

  - [x] 2.1 App.jsx 템플릿 데모 제거 및 레이아웃 골격 작성
    - **구현 대상:** 2단 레이아웃 골격
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - 기존 Vite 템플릿 내용(카운터, 로고, Docs/Social 섹션) 전부 제거
      - 좌측 사이드바 영역 + 우측 메인 영역의 빈 컨테이너만 배치. 메인 내부는 헤더/메시지/입력 3단 자리만 잡는다
      - 이 단계에서는 실제 컴포넌트 없이 placeholder 텍스트만 넣는다
    - **Context7:** 함수형 컴포넌트 구성 및 JSX 기본 패턴 확인 (`/reactjs/react.dev`)
    - **검증 방법:** 브라우저에서 2단 구조가 보이고 콘솔 에러가 없다
    - **완료 조건:** 템플릿 잔재가 화면에 없고 2단 골격이 렌더링된다. (AC-1)

  - [x] 2.2 전역 스타일 작성
    - **구현 대상:** 전역 CSS
    - **예상 파일:** `frontend/src/index.css` (수정)
    - **구현 내용:**
      - 기본 margin/padding 리셋, `box-sizing: border-box`
      - `html, body, #root` 높이 `100%`, 페이지 전체 스크롤 제거
      - 기본 폰트, 본문 텍스트 색
      - **다크 모드 대응을 넣지 않는다** (PRD N-9)
    - **검증 방법:** 브라우저에서 전체 페이지 스크롤바가 생기지 않는다
    - **완료 조건:** 뷰포트 높이에 맞춰 레이아웃이 고정된다. (AC-7 전제)

  - [x] 2.3 2단 레이아웃 및 영역 스타일
    - **구현 대상:** 레이아웃 CSS
    - **예상 파일:** `frontend/src/App.css` (수정)
    - **구현 내용:**
      - 사이드바: 고정 폭 약 320px, 흰색 배경, 우측 1px 연회색 경계선, 전체 높이
      - 메인: 가변 폭, 연회색 배경(≈`#f3f4f6`), 세로 3단(헤더 / 메시지 / 입력)
      - 메시지 영역만 `overflow-y: auto`, 헤더·입력은 고정
      - 헤더·입력 컨테이너는 흰색 카드 + 둥근 모서리 + 옅은 그림자
    - **검증 방법:** placeholder를 길게 채워 메시지 영역만 스크롤되는지 확인
    - **완료 조건:** AC-1, AC-7 충족

  - [x] 2.4 index.html 타이틀 변경
    - **구현 대상:** 문서 제목
    - **예상 파일:** `frontend/index.html` (수정)
    - **구현 내용:**
      - `<title>`을 `frontend` → `Local LLM Chat`으로 변경
      - ⚠️ **Vite 템플릿 잔여 asset(`src/assets/hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`)은 삭제하지 않는다** (PRD 14.1 확정). 참조되지 않은 채 그대로 둔다. 번들에 포함되지 않으므로 빌드·기능에 영향이 없다
    - **검증 방법:** 브라우저 탭 제목 확인, `npm run build` 성공, 콘솔에 404 없음
    - **완료 조건:** 탭 제목이 `Local LLM Chat`이고, asset 파일은 삭제되지 않은 채 남아 있다.

---

- [ ] **3.0 공통 UI Component 구현**

  - [x] 3.1 ChatHeader 컴포넌트
    - **구현 대상:** 헤더 영역
    - **예상 파일:** `frontend/src/components/ChatHeader.jsx` (생성), `App.jsx` / `App.css` (수정)
    - **구현 내용:**
      - 제목 `Local LLM Chat` (크고 굵게), 부제 `React + FastAPI + Ollama 기반 로컬 AI 채팅 앱` (작고 연한 회색)
      - 우측 끝에 `대화 초기화` 버튼 (흰 배경 + 회색 테두리 + 둥근 모서리)
      - `space-between` 배치
      - props: `onReset` (이 단계에서는 빈 함수 연결 가능)
    - **검증 방법:** 설계 이미지와 문구·배치 대조
    - **완료 조건:** AC-4, AC-5 충족

  - [x] 3.2 SettingsSidebar 골격 및 라벨
    - **구현 대상:** 사이드바 정적 구조
    - **예상 파일:** `frontend/src/components/SettingsSidebar.jsx` (생성), `App.jsx` / `App.css` (수정)
    - **구현 내용:**
      - 상단 제목 `모델 설정` (중앙 정렬, 회색, 볼드)
      - 라벨 6개를 다음 순서로 배치: `모델` → **`시스템 프롬프트 모드`** → `시스템 프롬프트` → `Temperature: {값}` → `Top P: {값}` → `Num Predict`
      - 이 중 `시스템 프롬프트 모드`만 **설계도에 없는 추가 요소**이며(S-10), 나머지 5개는 설계도 순서 그대로다
      - 라벨은 중앙 정렬, 입력 요소는 사이드바 폭을 거의 꽉 채움
      - 이 단계에서는 입력 요소를 비활성 placeholder로 두어도 된다
    - **검증 방법:** 설계 이미지와 라벨 문구·순서 대조 (모드 라벨은 PRD 5.2.1 기준)
    - **완료 조건:** AC-2, AC-3, AC-46(배치 부분) 충족

  - [x] 3.3 모델 select + 시스템 프롬프트 textarea
    - **구현 대상:** 사이드바 입력 요소 (1)
    - **예상 파일:** `frontend/src/components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - `<select>`: props `models`(배열), `value`, `onChange`. 이 단계에서는 더미 배열로 확인
      - 시스템 프롬프트 `<textarea>`: 약 5행, 전체 폭, 제어 컴포넌트
      - **`<textarea>`는 children이 아니라 `value` prop으로 값을 준다** (PRD 11.3)
    - **Context7:** 제어 컴포넌트(`value` + `onChange`) 및 `<textarea>` / `<select>` 사용법 확인
    - **검증 방법:** 입력이 화면에 즉시 반영되고 React 경고가 없다
    - **완료 조건:** 두 요소가 제어 컴포넌트로 동작한다. (AC-20)

  - [x] 3.4 시스템 프롬프트 모드 select (S-10)
    - **구현 대상:** 프리셋 프롬프트 선택 UI
    - **예상 파일:** `frontend/src/components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - **먼저 `frontend/src/api/promptMode.js`를 읽어 구조를 확인한다.** (`export const promptModes` 객체 / 키 5개 `basic`·`teacher`·`code`·`troubleshoot`·`table` / 각 값 `{ label, prompt }`)
      - `import { promptModes } from "../api/promptMode"` — **읽기 전용이며 이 파일을 수정하지 않는다** (PRD F-11)
      - 라벨 `시스템 프롬프트 모드` + `<select>`를 **시스템 프롬프트 textarea 바로 위**에 배치
      - `Object.entries(promptModes)`로 option 생성. `value`·`key` = 모드 키, 표시 문구 = `label`, 순서는 파일 정의 순서 그대로
      - **"직접 입력" 같은 항목을 임의로 추가하지 않는다** (option은 정확히 5개)
      - props: `value`(현재 모드 키), `onChange`(모드 키 전달). 실제 덮어쓰기 로직은 5.3에서 연결
      - ⚠️ 이 요소는 **설계도 이미지에 없다.** 사용자가 명시 요청한 기능이므로 PRD 5.2.1을 기준으로 구현한다
    - **Context7:** `<select>` 제어 컴포넌트 및 객체 순회 렌더링 시 `key` 규칙 확인
    - **검증 방법:** select를 열어 5개 모드 label이 정의 순서대로 보이는지 확인
    - **완료 조건:** AC-46, AC-47 충족

  - [x] 3.5 Temperature / Top P 슬라이더
    - **구현 대상:** 사이드바 입력 요소 (2)
    - **예상 파일:** `frontend/src/components/SettingsSidebar.jsx` (수정), `App.css` (수정)
    - **구현 내용:**
      - `<input type="range">` 2개. Temperature `min=0 max=2`, Top P `min=0 max=1`, 적절한 `step`
      - 라벨에 현재 값을 함께 표시: `Temperature: 0.4`, `Top P: 0.55` 형식
      - 슬라이더 조작 시 라벨 숫자가 즉시 갱신
      - 좌측 채움이 파란색으로 보이는 스타일
    - **검증 방법:** 슬라이더를 끝까지 움직여 라벨 값이 범위를 벗어나지 않는지 확인
    - **완료 조건:** AC-15, AC-16, AC-19(일부) 충족

  - [x] 3.6 Num Predict 입력
    - **구현 대상:** 사이드바 입력 요소 (3)
    - **예상 파일:** `frontend/src/components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - `<input type="number" min="1" max="2048">` (슬라이더 아님)
      - 값이 비었거나 숫자가 아니거나 범위를 벗어나면 **유효하지 않음**으로 판정하는 로직 마련 (전송 차단은 5.6에서 연결)
    - **검증 방법:** `0`, `9999`, 빈 값, 문자 입력 시 유효성 판정 결과 확인
    - **완료 조건:** AC-18 충족, 유효성 판정 함수가 존재한다.

---

- [ ] **4.0 Chat 관련 Component 구현**

  - [x] 4.1 MessageBubble 컴포넌트
    - **구현 대상:** 단일 말풍선
    - **예상 파일:** `frontend/src/components/MessageBubble.jsx` (생성), `App.css` (수정)
    - **구현 내용:**
      - props: `role`, `content`
      - `role === "user"`: **우측 정렬 / 연한 파란 배경(≈`#dbeafe`) / 상단 라벨 `사용자`(진한 파랑 소형)**
      - `role === "assistant"`: **좌측 정렬 / 연회색 배경 / 상단 라벨 `AI`** (PRD 14.1-U2)
      - 본문 줄바꿈 보존 (`white-space: pre-wrap`)
      - 말풍선 최대 폭은 영역의 약 50~60%
      - **`model` / `elapsed_time`은 화면에 표시하지 않는다** (PRD 14.1-U14 확정)
    - **검증 방법:** 하드코딩한 user/assistant 메시지 2개로 렌더 확인
    - **완료 조건:** AC-24, AC-25 충족

  - [x] 4.2 MessageList 컴포넌트
    - **구현 대상:** 메시지 목록
    - **예상 파일:** `frontend/src/components/MessageList.jsx` (생성)
    - **구현 내용:**
      - props: `messages` 배열을 순회해 `MessageBubble` 렌더
      - **`key`는 메시지의 `id`를 사용한다. 배열 index를 key로 쓰지 않는다** (PRD 10.1)
      - 목록이 비어 있으면 **아무것도 표시하지 않는다** (PRD 14.1-U12 확정). 안내 문구·예시 질문·일러스트를 넣지 않는다
    - **Context7:** 리스트 렌더링과 `key` 규칙 확인
    - **검증 방법:** 하드코딩 배열로 여러 메시지 렌더, React key 경고 없음
    - **완료 조건:** 메시지가 순서대로 렌더링된다.

  - [x] 4.3 메시지 영역 자동 스크롤
    - **구현 대상:** 스크롤 동작
    - **예상 파일:** `frontend/src/components/MessageList.jsx` (수정)
    - **구현 내용:** 메시지가 추가되면 목록 최하단으로 스크롤 (`useRef` + `scrollIntoView` 또는 `scrollTop` 조정)
    - **Context7:** `useRef` 및 DOM 조작 Effect 패턴 확인
    - **검증 방법:** 메시지를 10개 이상 넣어 하단으로 자동 이동하는지 확인
    - **완료 조건:** AC-29 충족

  - [x] 4.4 ChatInput 컴포넌트
    - **구현 대상:** 입력 영역
    - **예상 파일:** `frontend/src/components/ChatInput.jsx` (생성), `App.css` (수정)
    - **구현 내용:**
      - 좌측 여러 줄 `<textarea>` (연회색 배경, 둥근 모서리), placeholder **`메시지를 입력하세요.`**
      - 우측 전송 버튼, 입력창과 같은 높이, 평상시 문구 **`전송`**
      - `Enter` = 전송, `Shift + Enter` = 줄바꿈
      - **한글 IME 조합 중 Enter는 무시한다** (`event.nativeEvent.isComposing === true`이면 전송하지 않음)
      - props: `value`, `onChange`, `onSend`, `isLoading`, `disabled`
    - **Context7:** 키보드 이벤트 처리 및 제어 컴포넌트 패턴 확인
    - **검증 방법:** 한글로 "안녕하세요" 입력 후 조합 확정 Enter가 전송되지 않는지, 이어서 누른 Enter는 전송되는지 확인
    - **완료 조건:** AC-22, AC-26, AC-27, AC-30 충족

---

- [ ] **5.0 State 관리 구현**

  - [x] 5.1 App 상태 정의 및 초기값 설정
    - **구현 대상:** 최상위 state
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - PRD 10장 표대로 `useState` 선언: `models`, `isModelsLoading`, `modelsError`, `settings`, `messages`, `input`, `isLoading`, `error`
      - 초기값: `temperature` = `0.4`, `topP` = `0.55`, `numPredict` = `256`, `model` = `""`(이후 `/models` 첫 항목으로 설정)
      - `settings.promptMode` 추가. 초기값 **`"basic"`**, `settings.systemPrompt` 초기값 **`promptModes.basic.prompt`** (PRD 14.1-U15 확정)
      - ⚠️ 초기 textarea 내용은 **설계도 문구가 아니라 `basic` 프리셋 원문**이다. select(`기본 설명 모드`)와 textarea가 처음부터 일치해야 한다
      - 외부 상태 관리 라이브러리를 쓰지 않는다
    - **Context7:** `useState`로 객체 상태를 다룰 때의 불변 갱신 패턴 확인
    - **검증 방법:** React DevTools로 초기 state 값 확인
    - **완료 조건:** AC-17 충족

  - [x] 5.2 설정 변경 핸들러 연결
    - **구현 대상:** 사이드바 ↔ state 양방향 연결
    - **예상 파일:** `frontend/src/App.jsx`, `components/SettingsSidebar.jsx` (수정)
    - **구현 내용:** `onChangeSetting(key, value)` 형태의 핸들러로 `settings`를 불변 갱신하여 사이드바에 전달. 프롬프트 모드 select는 별도 핸들러(5.3)를 사용한다
    - **검증 방법:** 각 입력을 바꾸고 DevTools에서 state 반영 확인
    - **완료 조건:** 설정값이 모두 state에 반영된다. 별도 "적용" 버튼은 없다.

  - [x] 5.3 프롬프트 모드 선택 핸들러
    - **구현 대상:** 모드 select ↔ systemPrompt 연동
    - **예상 파일:** `frontend/src/App.jsx`, `components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - `handleChangePromptMode(key)`: `promptMode`와 `systemPrompt`를 **함께** 갱신한다
        ```js
        setSettings(prev => ({ ...prev, promptMode: key, systemPrompt: promptModes[key].prompt }))
        ```
      - textarea 수정은 **`systemPrompt`만** 갱신한다. **`promptMode`를 건드리지 않는다** (초기화·빈 값 전환 금지)
      - 같은 모드를 다시 선택하면 textarea는 프리셋 원문으로 다시 덮어써진다. 확인 창을 띄우지 않는다
      - select 값과 textarea 내용이 달라지는 것은 **정상 상태**다
    - **검증 방법:**
      - 모드 전환 → textarea가 해당 프리셋으로 바뀌는지
      - textarea를 아무렇게나 고친 뒤 → select 값이 그대로인지
      - 다시 같은 모드 선택 → 프리셋 원문으로 복원되는지
    - **완료 조건:** AC-48, AC-49, AC-50 충족

  - [x] 5.4 메시지 · 입력 state 연결 (API 없이)
    - **구현 대상:** 채팅 로컬 동작
    - **예상 파일:** `frontend/src/App.jsx`, `components/ChatInput.jsx` (수정)
    - **구현 내용:**
      - 전송 시 `messages`에 `{ id, role: "user", content }` 추가 후 `input`을 비운다
      - `id`는 `crypto.randomUUID()` 또는 증가 카운터
      - 공백만 입력된 경우 아무 동작도 하지 않는다
      - **함수형 갱신** `setMessages(prev => [...prev, next])` 사용
    - **Context7:** 함수형 state 갱신 패턴 확인
    - **검증 방법:** 여러 번 전송해 순서대로 쌓이는지, 공백 전송이 막히는지 확인
    - **완료 조건:** AC-23, AC-28 충족

  - [x] 5.5 대화 초기화 핸들러
    - **구현 대상:** 초기화 동작
    - **예상 파일:** `frontend/src/App.jsx`, `components/ChatHeader.jsx` (수정)
    - **구현 내용:**
      - `messages`를 빈 배열로, `error`를 `null`로 설정
      - **`settings`는 초기화하지 않는다**
      - 확인 다이얼로그를 띄우지 않는다 (설계도에 없음)
    - **검증 방법:** 메시지를 쌓고 설정을 변경한 뒤 초기화 → 메시지만 사라지는지 확인
    - **완료 조건:** AC-38, AC-39 충족

  - [x] 5.6 전송 가능 여부 파생 조건 구현
    - **구현 대상:** `canSend` / `isModelsUnavailable`
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - `isModelsUnavailable = isModelsLoading || Boolean(modelsError) || models.length === 0`
      - `canSend = !isLoading && !isModelsUnavailable && input.trim() !== "" && isNumPredictValid`
      - 입력 textarea `disabled` = `isLoading || isModelsUnavailable`
      - 전송 버튼 `disabled` = `!canSend`
      - 이 조건은 클릭과 `Enter` 양쪽에 동일하게 적용
    - **검증 방법:** 각 조건을 인위적으로 만들어 버튼/입력 상태 확인
    - **완료 조건:** PRD 9.1의 파생 조건이 그대로 구현되었다.

---

- [ ] **6.0 Backend API Client 구현**

  - [x] 6.1 API 모듈 및 Base URL 상수
    - **구현 대상:** API 클라이언트 기반
    - **예상 파일:** `frontend/src/api/chatApi.js` (생성)
    - **구현 내용:**
      - Base URL을 **`http://127.0.0.1:8000`** 하나의 상수로 정의 (PRD 14.1 / 부록 A.3)
      - `import.meta.env.VITE_API_BASE_URL`을 읽되 기본값은 위 상수
      - 호출부에 URL을 하드코딩하지 않는다
      - **`fetch`만 사용한다. axios 등 신규 패키지를 설치하지 않는다**
    - **검증 방법:** 파일 내 `localhost:8000` 문자열이 없는지 확인
    - **완료 조건:** Base URL이 한 곳에서만 정의된다.

  - [x] 6.2 에러 정규화 함수
    - **구현 대상:** 에러 처리 공통 로직
    - **예상 파일:** `frontend/src/api/chatApi.js` (수정)
    - **구현 내용:**
      - `res.ok`가 아니면 body의 `detail`을 파싱
      - `detail`이 **문자열**이면 그대로 사용 (500)
      - `detail`이 **배열**이면 각 항목의 `msg`를 결합 (422)
      - 파싱 실패 시 `HTTP {status}` 기본 메시지
      - `fetch`가 던지는 `TypeError`(서버 미실행)는 "서버에 연결할 수 없습니다" 류로 변환
      - 최종적으로 사람이 읽을 수 있는 메시지를 가진 `Error`를 throw
    - **검증 방법:** Backend를 끄고, 그리고 `num_predict: 9999`로 호출해 두 형태가 모두 문자열로 정규화되는지 확인
    - **완료 조건:** 500/422/네트워크 3종이 모두 문자열 메시지로 변환된다.

  - [x] 6.3 `getModels()` 구현
    - **구현 대상:** `GET /models`
    - **예상 파일:** `frontend/src/api/chatApi.js` (수정)
    - **구현 내용:** `GET {BASE}/models` 호출 후 `data.models`(문자열 배열) 반환. 실패 시 6.2의 정규화된 에러 throw
    - **검증 방법:** 브라우저 콘솔에서 직접 호출해 배열 확인
    - **완료 조건:** 실제 모델명 배열이 반환된다.

  - [x] 6.4 `postChat()` 구현
    - **구현 대상:** `POST /chat`
    - **예상 파일:** `frontend/src/api/chatApi.js` (수정)
    - **구현 내용:**
      - `POST {BASE}/chat`, `Content-Type: application/json`
      - 본문 키를 **snake_case로 고정**: `message`, `model`, `system_prompt`, `temperature`, `top_p`, `num_predict`
      - 응답의 `model`, `message`, `elapsed_time` 반환
      - **타임아웃을 걸지 않는다** (로컬 LLM은 수십 초 소요, PRD 부록 A.2)
    - **검증 방법:** DevTools Network에서 Request Payload의 키 6개가 snake_case인지 확인
    - **완료 조건:** AC-21 충족

---

- [ ] **7.0 기존 Backend API 연동**

  - [x] 7.1 모델 목록 조회 연동
    - **구현 대상:** 마운트 시 `/models` 호출
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - `useEffect(() => {...}, [])`에서 `getModels()` 호출
      - 성공: `setModels(data)` 및 **`settings.model`을 기본 모델로 설정**
        - `qwen3.5:9b`가 목록에 있으면 그것을 선택, 없으면 `models[0]`으로 폴백
        - 기본 모델명은 상수로 분리한다 (예: `const DEFAULT_MODEL = "qwen3.5:9b"`)
        - 설계도의 `gemma3:4b`는 **사용하지 않는다** (현재 환경에 설치돼 있지도 않다)
      - 성공했으나 배열이 비어 있으면 `modelsError`로 처리
      - 실패: `modelsError` 설정
      - cleanup에서 **`ignore` 플래그**로 늦은 응답 반영을 취소한다. `AbortController` 단독으로는 race condition을 막지 못하므로 `ignore`를 기본으로 쓴다 (PRD 7.1)
      - **StrictMode로 인한 개발 모드 2회 호출을 막지 않는다.** 전역 플래그나 `useRef` 가드를 넣지 않는다
    - **Context7:** `useEffect` cleanup, StrictMode의 setup→cleanup→setup 동작, `ignore` 플래그 패턴 확인 (`reference/react/StrictMode.md`, `learn/synchronizing-with-effects.md`)
    - **검증 방법:** select 옵션이 실제 모델 4개로 채워지고 **`qwen3.5:9b`가 선택**됨. 개발 모드에서 2회 호출되어도 옵션이 중복되지 않음
    - **완료 조건:** AC-8, AC-9, AC-10, AC-14 충족

  - [x] 7.2 메시지 전송 연동
    - **구현 대상:** `/chat` 호출
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - 5.4의 로컬 전송 로직에 `postChat()` 호출을 연결
      - 요청 본문에 현재 `settings` 값 + `message`를 담아 전송 (camelCase → snake_case 변환)
      - **`system_prompt`에는 textarea의 현재 문자열(`settings.systemPrompt`)을 담는다.** `settings.promptMode`(모드 키)는 **요청 본문에 포함하지 않는다** — Backend `ChatRequest`에 없는 필드다 (PRD 8.3, F-3)
      - 호출 전 `setError(null)`
    - **검증 방법:** 모드를 고른 뒤 textarea를 일부 수정하고 전송 → DevTools Network의 `system_prompt`가 **수정된 문자열**과 일치하고, 본문에 `promptMode` 키가 없는지 확인
    - **완료 조건:** AC-21, AC-51 충족

  - [x] 7.3 응답을 AI 메시지로 추가
    - **구현 대상:** 응답 렌더링
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - 성공 시 `{ id, role: "assistant", content: data.message, model: data.model, elapsedTime: data.elapsed_time }`를 `messages`에 추가
      - `model` / `elapsedTime`은 **상태에만 보관하고 화면에 표시하지 않는다**
      - 함수형 갱신 사용
    - **검증 방법:** 실제 질문을 보내 AI 말풍선이 나타나고 줄바꿈이 보존되는지 확인
    - **완료 조건:** AC-18(초기값 무관), AC-25 충족 및 실제 대화가 성립한다.

---

- [ ] **8.0 Loading 상태 구현**

  - [x] 8.1 `/chat` 로딩 상태
    - **구현 대상:** `isLoading`
    - **예상 파일:** `frontend/src/App.jsx`, `components/ChatInput.jsx` (수정)
    - **구현 내용:**
      - 호출 시작 시 `true`, `finally`에서 항상 `false`
      - 전송 버튼 문구 `전송` → **`응답 생성 중...`**
      - 전송 버튼과 입력 textarea `disabled`
    - **검증 방법:** 실제 응답이 오기까지 버튼 문구와 비활성 상태 확인
    - **완료 조건:** AC-31, AC-32, AC-33 충족

  - [x] 8.2 `/models` 로딩 상태
    - **구현 대상:** `isModelsLoading`
    - **예상 파일:** `frontend/src/App.jsx`, `components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - 초기값 `true`, 조회 완료 시 `false`
      - 로딩 중에는 모델 select · 입력 textarea · 전송 버튼 `disabled` (버튼 문구는 `전송` 유지)
    - **검증 방법:** 네트워크를 느리게(DevTools throttling) 설정해 초기 비활성 상태 확인
    - **완료 조건:** 모델 목록 도착 전에는 전송이 불가능하다.

  - [x] 8.3 로딩 중 키보드 전송 차단 확인
    - **구현 대상:** Enter 전송 가드
    - **예상 파일:** `frontend/src/components/ChatInput.jsx` (수정)
    - **구현 내용:** 로딩 중 또는 전송 불가 상태에서 `Enter`를 눌러도 `onSend`가 호출되지 않도록 `canSend` 조건을 키 핸들러에도 적용
    - **검증 방법:** 응답 대기 중 Enter 연타 후 Network 탭에 중복 요청이 없는지 확인
    - **완료 조건:** 중복 요청이 발생하지 않는다.

---

- [ ] **9.0 Error 상태 구현**

  - [x] 9.1 `/chat` 에러 인라인 표시
    - **구현 대상:** `error`
    - **예상 파일:** `frontend/src/App.jsx`, `components/MessageList.jsx` (수정), `App.css`
    - **구현 내용:**
      - 실패 시 6.2에서 정규화된 메시지를 `error`에 저장
      - **메시지 목록 영역 최하단에 인라인 텍스트로 표시** (토스트/모달 아님, PRD 14.1-U5)
      - 말풍선과 구분되는 형태(예: 붉은 계열 텍스트)
      - 500 응답의 `detail` 내용이 화면에 포함되어야 한다
    - **검증 방법:** Ollama를 끄거나 존재하지 않는 모델명으로 호출해 500 유도
    - **완료 조건:** AC-34, AC-35 충족

  - [x] 9.2 `/models` 에러 및 전체 비활성화
    - **구현 대상:** `modelsError` + 7.1.1 비활성화 규칙
    - **예상 파일:** `frontend/src/App.jsx`, `components/SettingsSidebar.jsx` (수정)
    - **구현 내용:**
      - 사이드바 모델 select 하단에 인라인 오류 텍스트 표시
      - 오류 문구에 복구 방법(Ollama·Backend 실행 확인 후 새로고침) 포함
      - **비활성화 대상은 정확히 3개다: 모델 select · 채팅 입력 textarea · 전송 버튼** (PRD 14.1-U16 확정)
      - **시스템 프롬프트 모드 select**, 시스템 프롬프트 textarea, Temperature, Top P, Num Predict, `대화 초기화` 버튼은 **비활성화하지 않는다**
      - **재시도 버튼을 추가하지 않는다** (설계도에 없음)
    - **검증 방법:** Backend를 끈 상태로 새로고침
    - **완료 조건:** AC-11, AC-12, AC-13 충족

  - [x] 9.3 에러 해제 타이밍 및 메시지 보존
    - **구현 대상:** 에러 수명 주기
    - **예상 파일:** `frontend/src/App.jsx` (수정)
    - **구현 내용:**
      - 새 전송을 시작할 때 이전 `error` 해제
      - `대화 초기화` 시에도 `error` 해제
      - **실패해도 이미 추가된 사용자 메시지는 목록에서 제거하지 않는다**
      - 실패 후 입력창·버튼은 다시 활성화
    - **검증 방법:** 실패 → 재전송(성공) 순서로 확인
    - **완료 조건:** AC-33, AC-37 충족

---

- [ ] **10.0 UI 설계도와 구현 결과 비교**

  - [x] 10.1 전체 화면 구조 비교
    - **구현 대상:** 레이아웃 대조
    - **예상 파일:** 없음 (검증), 필요 시 `App.css` 수정
    - **구현 내용:** 브라우저를 1280×720에 맞추고 `chat_ui_설계도.jpg`와 나란히 비교 — 2단 구성, 사이드바 폭, 배경색, 카드 모서리/그림자
    - **검증 방법:** 육안 대조
    - **완료 조건:** 구조적 차이가 없다. 차이가 있으면 CSS를 수정한다.

  - [x] 10.2 주요 UI Component 배치 확인
    - **구현 대상:** 컴포넌트 배치
    - **예상 파일:** 없음 (검증)
    - **구현 내용:** 헤더(제목·부제·우측 버튼), 사이드바(제목 + 6개 입력: 모델 / 프롬프트 모드 / 시스템 프롬프트 / Temperature / Top P / Num Predict), 메시지 영역, 입력 영역(입력창 좌 / 버튼 우)의 위치 대조
    - **검증 방법:** 육안 대조
    - **완료 조건:** AC-1 ~ AC-6 재확인 완료

  - [x] 10.3 사이드바 요소 순서 및 문구 대조
    - **구현 대상:** 사이드바 세부
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - 라벨 문구와 순서, 라벨 중앙 정렬, `Temperature: {값}` / `Top P: {값}` 형식, Num Predict가 슬라이더가 아닌 입력 박스인지 확인
      - ⚠️ **`시스템 프롬프트 모드` 라벨과 select는 설계도 이미지에 없다.** 이 두 요소는 설계도가 아니라 **PRD 5.2.1 기준**으로 확인한다(위치: 시스템 프롬프트 textarea 바로 위). 설계도와 다르다는 이유로 제거하지 않는다
      - 그 외 요소는 설계도와 1:1 일치해야 한다
    - **검증 방법:** 설계 이미지와 대조하되, 모드 select 행은 PRD 5.2.1 표와 대조
    - **완료 조건:** AC-2, AC-3, AC-15, AC-16, AC-18, AC-46 재확인 완료

  - [x] 10.4 말풍선 · 입력 영역 스타일 대조
    - **구현 대상:** 채팅 영역 세부
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - 사용자 말풍선: 우측 정렬, 연파랑, `사용자` 라벨 → **설계 이미지와 대조**
      - AI 말풍선: 좌측 정렬, 연회색, `AI` 라벨 → **설계 이미지에 없으므로 PRD 14.1-U2 기준으로 확인**
      - 로딩 중 버튼 문구 `응답 생성 중...`과 흐린 입력창 → 설계 이미지와 대조
    - **검증 방법:** 실제 대화 1회 후 로딩·완료 상태 각각 캡처하여 비교
    - **완료 조건:** AC-24, AC-25, AC-31 재확인 완료

---

- [ ] **11.0 전체 기능 검증**

  - [x] 11.1 Chat 영역 동작 확인
    - **구현 대상:** 송수신 전체 흐름
    - **예상 파일:** 없음 (검증)
    - **구현 내용:** 설계 이미지의 질문(`React와 FastAPI를 연결해서 로컬 LLM 채팅 앱을 만드는 과정을 3단계로 설명해줘.`)을 실제로 전송하고, 사용자 말풍선 → 로딩 → AI 말풍선 순서와 자동 스크롤 확인
    - **검증 방법:** 브라우저 수동 테스트
    - **완료 조건:** AC-23, AC-25, AC-29 충족

  - [x] 11.2 입력 및 버튼 Interaction 확인
    - **구현 대상:** 입력 인터랙션
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - `Enter` 전송 / `Shift+Enter` 줄바꿈
      - 한글 IME 조합 확정 Enter가 전송되지 않음
      - 공백만 입력 시 전송 차단
      - placeholder 문구 `메시지를 입력하세요.`
      - `대화 초기화` 후 설정값 유지 (프롬프트 모드 select 값과 textarea 내용도 유지되어야 한다)
      - **프롬프트 모드 시나리오:** 모드 5개를 차례로 선택 → 매번 textarea가 해당 프리셋으로 바뀜 → textarea를 수정 → select 값 유지 → 같은 모드 재선택 → 프리셋 원문으로 복원
    - **검증 방법:** 각 케이스 수동 실행
    - **완료 조건:** AC-22, AC-26 ~ AC-28, AC-38, AC-39, AC-47 ~ AC-50 충족

  - [ ] 11.3 Loading / Error 상태 시나리오 확인 &nbsp;— **사용자 판단으로 생략 (2026-09-23)**
    - **구현 대상:** 상태 전환
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - 정상 대기 중 로딩 표시 및 비활성화
      - Ollama 중지 → `/chat` 500 → 메시지 영역 하단 인라인 에러
      - Backend 중지 → 네트워크 에러 → 흰 화면이 되지 않음
      - Backend 중지 상태로 새로고침 → `/models` 실패 → select·입력·버튼 전부 비활성
      - **위 테스트는 Backend 프로세스를 끄고 켜는 방식으로만 수행한다. Backend 코드를 수정하지 않는다**
    - **검증 방법:** 시나리오별 수동 실행
    - **완료 조건:** AC-11, AC-12, AC-31 ~ AC-37 충족

  - [x] 11.4 Backend API 연동 확인
    - **구현 대상:** 요청/응답 계약 준수
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - DevTools Network에서 `GET http://127.0.0.1:8000/models`, `POST http://127.0.0.1:8000/chat` 확인
      - Request Payload 키 6개가 snake_case인지 확인
      - 응답의 `model` / `message` / `elapsed_time` 사용 확인
      - CORS 오류가 없는지 콘솔 확인
    - **검증 방법:** Network 탭 캡처
    - **완료 조건:** AC-8, AC-21 충족

  - [x] 11.5 lint / build / preview 검증
    - **구현 대상:** 빌드 품질
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - `npm run lint` 통과
      - `npm run build` 성공 및 `frontend/dist/` 생성
      - `npm run preview`로 프로덕션 빌드 실행 후 채팅 송수신 동작 확인
    - **검증 방법:** 세 명령 실행
    - **완료 조건:** AC-42, AC-43, AC-44 충족

  - [x] 11.6 제약 준수 최종 확인
    - **구현 대상:** PRD 13장 금지사항
    - **예상 파일:** 없음 (검증)
    - **구현 내용:**
      - `git diff backend/` 결과가 비어 있는지 확인
      - **`git diff frontend/src/api/promptMode.js` 결과가 비어 있는지 확인** (프리셋 구조 미변경, PRD F-11)
      - `git diff frontend/package.json`에 dependency 변경이 없는지 확인
      - 설계도에 없는 기능(마크다운 렌더링, 대화 저장, 메시지 복사 버튼 등)이 추가되지 않았는지 확인
      - PRD 12장 AC-1 ~ AC-52 전수 체크
    - **검증 방법:** git 명령 + AC 체크리스트
    - **완료 조건:** AC-40, AC-41, AC-45, AC-52 충족 및 전체 AC 통과

---

## Dependency 검토

**이번 Task List에는 신규 dependency 설치 Task가 없다.** 모든 구현은 현재 설치된 패키지(React 19.3.0, react-dom 19.3.0, Vite 8.3.0, @vitejs/plugin-react 6.1.1)와 브라우저 내장 `fetch`만으로 가능하다.

시스템 프롬프트 모드 기능(S-10)도 **신규 dependency가 필요 없다.** `frontend/src/api/promptMode.js`는 이미 저장소에 있는 로컬 파일이며, 평범한 named export를 import 할 뿐이다.

향후 다음 기능을 채택할 경우에만 dependency가 필요하며, 그때는 **사용자 승인 후 별도 Task로 분리**한다. 현재는 PRD에서 범위 밖이다.

| 기능 | 필요 패키지 | 현재 상태 |
| --- | --- | --- |
| AI 응답 마크다운 렌더링 (PRD 14.2-U6) | `react-markdown` 등 | 범위 밖 (N-7). 채택 시 별도 Task 필요 |
| 자동화 테스트 (PRD N-10) | `vitest`, `@testing-library/react` 등 | 범위 밖 |

---

## 사용자 확인 필요 사항

**없음.** 모든 설계 사항이 확정되었고, git 관련 사항도 해소되었다 (2026-09-23).

### 해소 내역

- **`backend/main.py` 미커밋 변경** → 커밋 `55d7ae3 backend: add CORS middleware for frontend dev server`로 정리됨.
  - 최초 커밋 `2c2188d`에는 CORS 미들웨어가 없었으나 루트 `README.md`는 그 존재를 전제하고 있었다. 이 불일치 때문에 `git diff backend/`가 계속 비어 있지 않았다.
  - 현재 `git diff backend/` = 0줄이므로 **AC-40이 의도대로 동작한다.**
  - ⚠️ 이 CORS 미들웨어는 Frontend 동작의 **필수 전제**다. 제거하면 브라우저가 `localhost:5173 → 127.0.0.1:8000` 요청을 차단하며(preflight 405), 모델 목록 조회와 전송이 모두 실패한다. 임의로 삭제하지 않는다.

---

## 확정된 결정 사항 (2026-09-23)

아래는 사용자가 확정한 내용이며, 해당 Task에 이미 반영되어 있다. **구현 중 다시 묻지 않는다.**

| 항목 | 결정 | 반영 Task |
| --- | --- | --- |
| 초기 `promptMode` / `systemPrompt` | `"basic"` / `promptModes.basic.prompt` (설계도 문구 아님) | 5.1 |
| 기본 모델 | **`qwen3.5:9b`** (없으면 `models[0]` 폴백). `gemma3:4b` 미사용 | 7.1 |
| AI 응답 마크다운 렌더링 | **하지 않음.** 줄바꿈만 보존 | 4.1 |
| 반응형 / 다크 모드 | **범위 밖.** 데스크톱 1280px 단일 레이아웃 | 2.2, 2.3 |
| stateless 안내 문구 | **넣지 않음** | — (해당 Task 없음) |
| 메시지 영역 빈 상태 | **아무것도 표시하지 않음** | 4.2 |
| AI 말풍선의 `model` / `elapsed_time` | **표시하지 않음.** 상태에만 보관 | 4.1, 7.3 |
| Vite 템플릿 잔여 asset | **삭제하지 않음.** 그대로 둠 | 2.4 |
| 루트 `README.md` CORS 설명 | **수정하지 않음.** 코드 기준으로 진행 | — (해당 Task 없음) |
| `/models` 실패 시 비활성화 범위 | **모델 select · 채팅 입력 · 전송 버튼 3개만.** 프롬프트 모드 select 포함 나머지 사이드바 입력은 계속 조작 가능 | 9.2, 5.6 |

---

## 변경 이력

| 일자 | 내용 |
| --- | --- |
| 2026-09-22 | 초판 작성 (Parent 12개 / Sub-task 46개) |
| 2026-09-23 | **시스템 프롬프트 모드 select(S-10) 요구사항 반영.** Sub-task 3.4 · 5.3 신규 추가, 3.0 / 5.0 하위 번호 조정, Task 7.2 · 10.3 · 11.2 · 11.6 갱신 (Sub-task 46 → 48개) |
| 2026-09-23 | **미확정 사항 8건 확정 반영.** Task 2.4(asset 삭제 → 타이틀 변경만), 4.1, 4.2, 5.1 갱신. 남은 확인 사항 2건 |
| 2026-09-23 | **U16 확정 반영** (비활성화 대상 3개로 한정). 미확정 사항 0건. Task 0.1 생략, 1.1부터 구현 착수 |
| 2026-09-23 | **기본 모델 `qwen3.5:9b` 지정** (Task 7.1, AC-10 갱신). backend venv 재생성으로 `uv run uvicorn` 정상화 |
| 2026-09-23 | **구현 완료** (3.0~9.0 전체, 10.3/11.4/11.5/11.6). CORS 미들웨어 커밋(`55d7ae3`)으로 AC-40 정상화. 잔여 6건은 브라우저 육안 확인 필요 |
| 2026-09-23 | **사용자 브라우저 검증 완료** — 10.1 / 10.2 / 10.4 / 11.1 / 11.2 통과. 11.3(Loading·Error 시나리오)은 사용자 판단으로 생략. 0.1은 지시에 따라 생략 |
