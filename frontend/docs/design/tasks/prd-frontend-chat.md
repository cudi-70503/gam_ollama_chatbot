# PRD: Local LLM Chat Frontend (React)

- 문서 버전: 1.0
- 작성일: 2026-09-22
- 대상 독자: 주니어 React 개발자
- 설계 기준 이미지: `frontend/docs/design/chat_ui_설계도.jpg`
- 관련 규칙 문서: `frontend/docs/design/create-prd.md`

---

## 1. 프로젝트 목적

### 1.1 배경

현재 저장소에는 이미 동작하는 Backend(`backend/`, FastAPI + Ollama)가 존재한다.
Backend는 `/chat`, `/models` 두 개의 HTTP API를 제공하지만, 이를 사용할 수 있는 화면이 없다.
현재 `frontend/`는 Vite + React 기본 템플릿(카운터 데모) 상태이며 실제 채팅 기능이 전혀 없다.

### 1.2 목적

기존 Backend를 **한 줄도 수정하지 않고**, 설계도 이미지에 정의된 화면을 React로 구현하여
사용자가 브라우저에서 로컬 LLM과 대화하고 모델 파라미터를 조절할 수 있게 한다.

### 1.3 성공 기준 (Success Metrics)

1. 사용자가 `npm run dev`로 실행한 화면에서, 별도 도구(curl, Swagger UI) 없이 로컬 LLM과 대화를 완료할 수 있다.
2. 사이드바에서 변경한 모델/파라미터 값이 실제 `/chat` 요청 본문에 그대로 반영된다.
3. Backend 코드(`backend/**`)의 git diff가 0이다.

---

## 2. 개발 범위 (In Scope)

| # | 범위 | 설명 |
| --- | --- | --- |
| S-1 | 채팅 화면 전체 레이아웃 | 좌측 설정 사이드바 + 우측 채팅 영역 2단 구성 |
| S-2 | 모델 목록 조회 | `GET /models` 호출 후 select 옵션으로 표시 |
| S-3 | 모델 설정 입력 UI | 모델, 시스템 프롬프트, Temperature, Top P, Num Predict |
| S-4 | 메시지 전송 | `POST /chat` 호출 및 응답 표시 |
| S-5 | 메시지 목록 렌더링 | 사용자 메시지 / AI 응답 메시지 말풍선 |
| S-6 | 대화 초기화 | 화면에 표시된 메시지 목록 비우기 |
| S-7 | 로딩 상태 | 응답 대기 중 입력/버튼 비활성화 및 "응답 생성 중..." 표시 |
| S-8 | 에러 상태 | API 실패 시 사용자에게 오류 안내 |
| S-9 | 스타일링 | 설계도 이미지에 준하는 CSS (플레인 CSS, 신규 라이브러리 없음) |
| S-10 | **시스템 프롬프트 모드 select** | 기존 `frontend/src/api/promptMode.js`의 프리셋을 select로 제공하고, 선택 시 시스템 프롬프트 textarea를 채운다 (5.2.1) |

---

## 3. 개발 제외 범위 (Out of Scope / Non-Goals)

| # | 제외 항목 | 사유 |
| --- | --- | --- |
| N-1 | `backend/` 코드 수정 | 명시적 제약. API endpoint / schema 변경 금지 |
| N-2 | 신규 npm 패키지 설치 | 명시적 제약. 현재 설치된 의존성만 사용 |
| N-3 | 대화 이력을 Backend로 전송 (멀티턴 컨텍스트) | Backend `/chat`은 단일 `message`만 받으며 history 필드가 없음 (→ 부록 A.1 참조) |
| N-4 | 스트리밍 응답 (SSE/WebSocket) | Backend가 단일 JSON 응답만 반환 |
| N-5 | 대화 저장/불러오기, localStorage 영속화 | 설계도에 해당 UI 없음 |
| N-6 | 로그인/인증, 사용자 계정 | 설계도 및 Backend에 해당 기능 없음 |
| N-7 | 마크다운 렌더링, 코드 하이라이팅 | 신규 의존성이 필요하며 **하지 않기로 확정** (→ 14.1-U6). 줄바꿈만 보존 |
| N-8 | 메시지 복사/재생성/편집/삭제 버튼 | 설계도에 해당 UI 없음 |
| N-9 | 다크 모드, 반응형 모바일 레이아웃 | **범위 밖으로 확정** (→ 14.1-U9). 데스크톱 1280px 단일 레이아웃 |
| N-10 | 테스트 코드 작성, 배포 설정 | 이번 범위 밖 |

> **원칙:** 설계 이미지에 없는 기능은 임의로 추가하지 않는다. 필요해 보이더라도 "미확정 사항"(14장)에 기록하고 구현하지 않는다.

---

## 4. 기존 Backend API Contract (변경 금지)

### 4.1 실행 정보

| 항목 | 값 | 근거 |
| --- | --- | --- |
| Base URL | `http://127.0.0.1:8000` | `backend/main.py` `uvicorn.run(host="127.0.0.1", port=8000)` |
| Host / Port | `127.0.0.1` / `8000` | 동일 |
| API 문서 | `http://127.0.0.1:8000/docs` | FastAPI 기본 |
| 실행 명령 | `cd backend && uv run uvicorn main:app --reload --port 8000` | 루트 `README.md` |
| Frontend Dev 서버 | `http://localhost:5173` | Vite 기본값 (`frontend/vite.config.js`에 port 설정 없음) |

### 4.2 CORS 설정

`backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- **현재 코드 기준 모든 Origin이 허용**되므로, Frontend에서 `http://127.0.0.1:8000`을 직접 호출해도 CORS 오류가 발생하지 않는다.
- Vite dev proxy 설정은 **필수가 아니다**. (`vite.config.js`에 현재 proxy 없음)
- ⚠️ 주의: 루트 `README.md`에는 "CORS 설정은 `http://localhost:5173`만 허용"이라고 적혀 있으나, **실제 코드는 `["*"]`** 이다. 코드가 기준이며, **README는 수정하지 않는다** (14.1-U10 확정).
- ⚠️ 참고: `allow_origins=["*"]`와 `allow_credentials=True`는 브라우저 스펙상 함께 동작하지 않지만, 본 Frontend는 쿠키/인증 정보를 보내지 않으므로 영향이 없다. **이 설정을 고치지 않는다.**

### 4.3 `POST /chat`

- **Method:** `POST`
- **Path:** `/chat`
- **Content-Type:** `application/json`
- **정의 위치:** `backend/main.py`, `backend/schema.py` (`ChatRequest`, `ChatResponse`)

#### Request Body (`ChatRequest`)

| 필드 | 타입 | 필수 | 기본값 | 제약 |
| --- | --- | --- | --- | --- |
| `message` | `str` | ✅ 필수 | - | 사용자가 입력한 질문 |
| `model` | `str` | 선택 | `"exaone3.5:7.8b"` | Ollama 모델명 |
| `system_prompt` | `str` | 선택 | `"너는 초보자를 돕는 친절한 AI 강사다."` | 시스템 프롬프트 |
| `temperature` | `float` | 선택 | `0.6` | `0.0 <= x <= 2.0` |
| `top_p` | `float` | 선택 | `0.7` | `0.0 <= x <= 1.0` |
| `num_predict` | `int` | 선택 | `256` | `1 <= x <= 2048` |

예시:

```json
{
  "message": "React와 FastAPI를 연결해서 로컬 LLM 채팅 앱을 만드는 과정을 3단계로 설명해줘.",
  "model": "gemma3:4b",
  "system_prompt": "너는 초보자를 돕는 AI 강사다. 답변은 명확하고 간결하게 작성한다.",
  "temperature": 0.4,
  "top_p": 0.55,
  "num_predict": 256
}
```

#### Response Body (`ChatResponse`, 200 OK)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `model` | `str` | 응답에 사용된 모델명 |
| `message` | `str` | AI 응답 본문 |
| `elapsed_time` | `float` | 처리 소요 시간(초, 소수점 3자리) |

```json
{
  "model": "gemma3:4b",
  "message": "1단계: ...",
  "elapsed_time": 12.345
}
```

#### 에러 응답

| Status | Body | 발생 조건 |
| --- | --- | --- |
| `422` | `{"detail": [ ...pydantic validation errors... ]}` | 제약 조건 위반 (예: `temperature` > 2.0, `num_predict` > 2048) |
| `500` | `{"detail": "채팅 처리 중 오류가 발생했습니다: <원인>"}` | Ollama 미실행, 모델 미존재 등 |

> ⚠️ `422`의 `detail`은 **배열**, `500`의 `detail`은 **문자열**이다. 에러 메시지를 화면에 출력할 때 두 형태를 모두 처리해야 한다.

#### 중요한 특성

- **Stateless(무상태)**: `/chat`은 요청마다 `[system_prompt, message]` 두 개의 메시지만 Ollama에 전달한다(`backend/ollama_chat.py`). **이전 대화 내용은 전달되지 않는다.** 즉 화면의 대화 목록은 표시용이며, 모델은 직전 대화를 기억하지 못한다.
- **응답 지연**: 로컬 LLM 추론이므로 수 초 ~ 수십 초가 걸릴 수 있다. 로딩 UI가 필수다.

### 4.4 `GET /models`

- **Method:** `GET`
- **Path:** `/models`
- **Request:** 없음 (query/body 없음)

#### Response Body (200 OK)

```json
{
  "models": ["gemma3:4b", "exaone3.5:7.8b", "qwen3:8b"]
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `models` | `string[]` | 로컬 Ollama 모델명 배열. `http://localhost:11434/api/tags`의 각 항목 `name` 값 |

#### 에러 응답

| Status | Body | 발생 조건 |
| --- | --- | --- |
| `500` | `{"detail": "모델 목록 조회 중 오류가 발생했습니다.: <원인>"}` | Ollama 미실행 등 |

> `/models`는 `response_model`이 지정되어 있지 않으며 Pydantic 모델도 없다. 위 형태는 `backend/main.py`의 `return {"models": models}` 코드에 근거한다.

---

## 5. UI 설계도 기반 화면 구조

> 근거: `frontend/docs/design/chat_ui_설계도.jpg` (1280 × 720 기준)

### 5.1 전체 Layout

```
┌──────────────────┬──────────────────────────────────────────────────────┐
│                  │  ┌────────────────────────────────────────────────┐  │
│                  │  │ Local LLM Chat                  [ 대화 초기화 ] │  │
│   모델 설정       │  │ React + FastAPI + Ollama 기반 로컬 AI 채팅 앱    │  │
│   (Sidebar)      │  └────────────────────────────────────────────────┘  │
│                  │                                                      │
│   [모델 select]  │                        ┌──────────────────────────┐  │
│   [시스템 프롬프트]│                        │ 사용자                    │  │
│   [Temperature]  │                        │ React와 FastAPI를 ...     │  │
│   [Top P]        │                        └──────────────────────────┘  │
│   [Num Predict]  │                (메시지 목록 영역, 세로 스크롤)         │
│                  │                                                      │
│                  │  ┌────────────────────────────┐ ┌─────────────────┐  │
│                  │  │  (입력 textarea)            │ │ 응답 생성 중... │  │
│                  │  └────────────────────────────┘ └─────────────────┘  │
└──────────────────┴──────────────────────────────────────────────────────┘
   고정 폭 ~320px          가변 폭 (남은 영역), 배경 연회색
```

- 화면 전체 높이 = 뷰포트 높이 (`100vh`), 페이지 전체 스크롤 없음
- 좌측 사이드바: 고정 폭(≈320px), 배경 흰색, 우측 경계선 1px 연회색, 전체 높이
- 우측 메인: 가변 폭, 배경 연회색(≈`#f3f4f6`), 내부에 상/중/하 3단(헤더 / 메시지 / 입력) 세로 배치
- 우측 메인 내부 카드(헤더 카드, 입력 카드)는 흰색 배경 + 둥근 모서리 + 옅은 그림자

### 5.2 Sidebar 영역 — "모델 설정"

| 순서 | 요소 | 형태 | 이미지상 값 |
| --- | --- | --- | --- |
| 1 | 섹션 제목 | 텍스트 (중앙 정렬, 회색, 볼드) | `모델 설정` |
| 2 | 라벨 | 텍스트 (중앙 정렬, 소형) | `모델` |
| 3 | 모델 선택 | `<select>` 드롭다운, 전체 폭 | `gemma3:4b` 선택됨 |
| 4 | 라벨 | 텍스트 | `시스템 프롬프트 모드` ⭐ |
| 5 | 프롬프트 모드 선택 | `<select>` 드롭다운, 전체 폭 | ⭐ **설계도에 없음** — 사용자 요청으로 추가 (5.2.1) |
| 6 | 라벨 | 텍스트 | `시스템 프롬프트` |
| 7 | 시스템 프롬프트 입력 | `<textarea>` 여러 줄(≈5행), 전체 폭 | `너는 초보자를 돕는 AI 강사다. 답변은 명확하고 간결하게 작성한다.` |
| 8 | 라벨 + 현재값 | 텍스트 | `Temperature: 0.4` |
| 9 | Temperature | `<input type="range">` 슬라이더 (좌측 파란색 트랙) | 0.4 |
| 10 | 라벨 + 현재값 | 텍스트 | `Top P: 0.55` |
| 11 | Top P | `<input type="range">` 슬라이더 | 0.55 |
| 12 | 라벨 | 텍스트 | `Num Predict` |
| 13 | Num Predict | `<input type="number" min="1" max="2048">` (단일 줄 박스형) | `256` |

> ⭐ 4·5번 행은 **설계도 이미지에 없는 요소**이며, 사용자가 명시적으로 추가를 요청한 기능이다(S-10). 그 외 요소는 모두 설계도 근거다.

관찰 사항:
- 라벨은 모두 **중앙 정렬**, 입력 요소는 사이드바 폭을 거의 꽉 채운다.
- Temperature / Top P는 **라벨에 현재 값이 함께 표시**된다 (`Temperature: 0.4` 형식). 값 변경 시 라벨도 즉시 갱신되어야 한다.
- Num Predict는 슬라이더가 아니라 **입력 박스**다. `type="number"`, `min="1"`, `max="2048"`을 지정한다 (Backend 제약과 동일).
- Num Predict 입력이 비어 있거나 숫자가 아니거나 범위를 벗어나면 **전송 버튼을 비활성화**한다 (잘못된 값으로 422를 유발하지 않는다).
- 사이드바에는 "적용" 버튼이 없다. 값은 상태로 유지되었다가 전송 시점에 함께 보내진다.

#### 5.2.1 시스템 프롬프트 모드 select (S-10)

**데이터 출처:** `frontend/src/api/promptMode.js` — 이미 저장소에 존재하는 파일이다.

```js
export const promptModes = {
  basic:        { label: "기본 설명 모드",    prompt: `...` },
  teacher:      { label: "강사용 설명 모드",  prompt: `...` },
  code:         { label: "코드 멘토 모드",    prompt: `...` },
  troubleshoot: { label: "오류 해결 모드",    prompt: `...` },
  table:        { label: "표 형식 정리 모드", prompt: `...` },
}
```

- **named export `promptModes`**, 모드 키를 프로퍼티로 갖는 평범한 객체이며 각 값은 `{ label, prompt }` 형태다.
- **이 파일의 데이터 구조를 변경하지 않는다.** 모드 추가/삭제, 키 이름 변경, 배열로의 변환, 기본 export 전환 등을 하지 않는다 (F-11). Frontend는 이 파일을 **읽기 전용으로 import** 한다.

**UI 사양**

| 항목 | 내용 |
| --- | --- |
| 위치 | 사이드바의 **시스템 프롬프트 영역 안**, `시스템 프롬프트` 라벨/textarea **바로 위** |
| 라벨 | `시스템 프롬프트 모드` |
| 요소 | `<select>`, 전체 폭 (모델 select와 동일한 스타일) |
| option 생성 | `Object.entries(promptModes)`를 순회. `value` = 모드 키(`basic` 등), 표시 문구 = `label`, React `key` = 모드 키 |
| option 순서 | 파일에 정의된 순서 그대로: `basic` → `teacher` → `code` → `troubleshoot` → `table` |
| option 개수 | 5개. **임의로 "직접 입력" 같은 항목을 추가하지 않는다** |

**동작 규칙 (중요)**

1. 모드를 선택하면 `promptModes[key].prompt` 문자열을 **시스템 프롬프트 textarea에 그대로 표시**한다(기존 내용을 덮어쓴다).
2. textarea는 그 후에도 **계속 자유롭게 수정 가능**하다. 읽기 전용이 되지 않는다.
3. 사용자가 textarea를 수정해도 **select의 현재 선택값은 그대로 유지**한다. 모드를 "직접 입력"이나 빈 값으로 되돌리지 않는다.
   → 즉 select 값과 textarea 내용이 **일치하지 않는 상태가 정상**이며, select는 "마지막으로 고른 프리셋"을 뜻한다.
4. 같은 모드를 다시 선택하면 textarea는 해당 프리셋 원문으로 **다시 덮어써진다** (사용자의 수정 내용은 사라진다). 별도 확인 창을 띄우지 않는다.
5. `POST /chat`의 `system_prompt`에는 **select 값(모드 키)이 아니라 textarea의 현재 문자열**을 보낸다 (8.3 참조).

### 5.3 Header 영역

| 요소 | 내용 | 스타일 |
| --- | --- | --- |
| 제목 | `Local LLM Chat` | 크고 굵은 검정 텍스트 |
| 부제 | `React + FastAPI + Ollama 기반 로컬 AI 채팅 앱` | 작고 연한 회색 텍스트 |
| 우측 버튼 | `대화 초기화` | 흰 배경 + 회색 테두리 + 둥근 모서리 (outline 버튼) |

- 제목/부제는 좌측 정렬, 버튼은 우측 끝 정렬 (`space-between`).
- 헤더는 흰색 카드 형태이며 메인 영역 상단에 고정된다.

### 5.4 Message 영역

| 요소 | 관찰 내용 |
| --- | --- |
| 영역 배경 | 연회색 (메인 배경과 동일, 별도 카드 없음) |
| 사용자 말풍선 | **우측 정렬**, 연한 파란색 배경(≈`#dbeafe`), 둥근 모서리, 폭은 영역의 약 50% |
| 말풍선 상단 라벨 | `사용자` — 진한 파란색 소형 텍스트 |
| 말풍선 본문 | 검정 텍스트, 줄바꿈 허용 |
| 스크롤 | 메시지가 늘어나면 이 영역만 세로 스크롤 (헤더/입력창 고정) |
| 빈 상태 | 메시지가 없으면 **아무것도 표시하지 않는다** (14.1-U12 확정). 안내 문구·예시 질문·일러스트 등을 넣지 않는다 |

#### AI 말풍선 (설계도에 미캡처 → 확정된 사양)

설계도 이미지에는 AI(assistant) 말풍선이 캡처되어 있지 않으나, 다음과 같이 **확정**한다 (14.1-U2).

| 요소 | 확정 사양 |
| --- | --- |
| 정렬 | **좌측 정렬** (사용자 말풍선의 반대편) |
| 배경색 | **연회색** (사용자 말풍선의 연파랑과 구분되는 중립 회색) |
| 상단 라벨 | **`AI`** |
| 본문 | 검정 텍스트. 응답의 줄바꿈(`\n`)을 보존한다 (예: `white-space: pre-wrap`) |
| 폭 | 사용자 말풍선과 동일한 최대 폭 기준 |

> AI 말풍선에 `model` / `elapsed_time`은 **표시하지 않는다** (14.1-U14 확정). 값은 상태에만 보관한다.

#### 에러 표시 위치 (확정)

`/chat` 실패 메시지는 **메시지 목록 영역의 최하단에 인라인으로** 표시한다 (14.1-U5). 토스트나 모달을 쓰지 않으며, 말풍선과 구분되는 형태(예: 붉은 계열 텍스트)로 목록 마지막 메시지 아래에 놓는다.

### 5.5 Input 영역

| 요소 | 관찰 내용 |
| --- | --- |
| 컨테이너 | 흰색 카드, 둥근 모서리, 그림자, 메인 영역 하단 고정 |
| 입력창 | 좌측, 넓은 폭의 **여러 줄 textarea**, 연회색 배경, 둥근 모서리 |
| 전송 버튼 | 우측, 세로로 입력창과 같은 높이, 둥근 모서리, 굵은 텍스트 |
| 캡처된 버튼 문구 | `응답 생성 중...` (= **로딩 중 상태**) |
| 캡처된 입력창 상태 | 텍스트가 옅은 회색으로 흐릿하게 표시 → **비활성화(disabled) 상태**로 보임 |

이미지가 "응답 생성 중" 상태를 캡처한 것이므로 평상시(idle) 문구는 이미지에서 확인할 수 없었으나, 다음과 같이 **확정**한다.

| 요소 | 확정 문구 |
| --- | --- |
| 전송 버튼 — 평상시(idle) | **`전송`** (14.1-U3) |
| 전송 버튼 — 로딩 중 | `응답 생성 중...` (이미지 근거) |
| 입력 textarea — placeholder | **`메시지를 입력하세요.`** (14.1-U4) |

키보드 동작도 다음과 같이 **확정**한다 (14.1-U8).

| 키 | 동작 |
| --- | --- |
| `Enter` | 메시지 전송 |
| `Shift` + `Enter` | 줄바꿈 |

### 5.6 Loading / Error 상태가 필요한 위치

| 위치 | 상태 | 근거 / 확정 내용 |
| --- | --- | --- |
| 전송 버튼 | 로딩 (`응답 생성 중...` + disabled) | ✅ 이미지에 존재 |
| 입력 textarea | 로딩 중 disabled | ✅ 이미지에 존재 (흐린 표시) |
| 모델 select | 목록 로딩 중 / 조회 실패 시 disabled | ❌ 이미지에 없음 → 확정: 7.1.1 비활성화 규칙 |
| 입력 textarea · 전송 버튼 | 모델 목록 조회 실패 시 disabled | ❌ 이미지에 없음 → 확정: 7.1.1 비활성화 규칙 |
| 사이드바 (모델 select 하단) | 모델 목록 조회 실패 메시지 | ❌ 이미지에 없음 → 확정: 인라인 텍스트 |
| 메시지 영역 최하단 | `/chat` 실패 시 에러 표시 | ❌ 이미지에 없음 → 확정: 인라인 텍스트 (14.1-U5) |

---

## 6. React Component 후보와 책임

> 제안 구조이며, 파일 경로는 구현 단계에서 조정 가능하다. **컴포넌트는 상태를 소유하지 않고 props로 받는 것을 기본**으로 한다 (상태는 `App`이 소유).

```
frontend/src/
├── main.jsx                  (기존 유지)
├── App.jsx                   ← 전면 재작성
├── index.css                 ← 전역 스타일 재작성
├── App.css                   ← 레이아웃 스타일 재작성
├── api/
│   ├── chatApi.js
│   └── promptMode.js         (기존 파일 — 읽기 전용 import, 구조 변경 금지)
└── components/
    ├── SettingsSidebar.jsx
    ├── ChatHeader.jsx
    ├── MessageList.jsx
    ├── MessageBubble.jsx
    └── ChatInput.jsx
```

| Component | 책임 | 주요 props |
| --- | --- | --- |
| `App` | 최상위. 모든 상태 소유, API 호출 오케스트레이션, 2단 레이아웃 배치 | - |
| `SettingsSidebar` | "모델 설정" 영역 렌더링. 모델 select, **프롬프트 모드 select**, 시스템 프롬프트 textarea, Temperature/Top P 슬라이더, Num Predict 입력. `promptModes`를 직접 import 하여 option을 만든다 | `models`, `settings`, `onChangeSetting`, `onChangePromptMode`, `disabled`, `modelsError` |
| `ChatHeader` | 제목/부제 표시, "대화 초기화" 버튼 노출 | `onReset`, `disabled` |
| `MessageList` | 메시지 배열을 순회하여 `MessageBubble` 렌더링, 목록 최하단에 에러 인라인 표시, 새 메시지 도착 시 하단 자동 스크롤 | `messages`, `isLoading`, `error` |
| `MessageBubble` | 단일 메시지 말풍선. role에 따라 정렬/색상/라벨 분기 | `role`, `content`, (선택) `model`, `elapsedTime` |
| `ChatInput` | 입력 textarea + 전송 버튼. placeholder 표시, `Enter` 전송 / `Shift+Enter` 줄바꿈 처리, 로딩·비활성 상태에서 disabled 및 버튼 문구 전환 | `value`, `onChange`, `onSend`, `isLoading`, `disabled` |
| `api/chatApi.js` | `fetch` 래퍼. `getModels()`, `postChat(payload)` 제공. 에러를 일관된 `Error` 객체로 변환 | - |

### 6.1 `api/chatApi.js` 규약

- Base URL은 상수 또는 Vite 환경변수(`import.meta.env.VITE_API_BASE_URL`)로 분리하고, 기본값은 **`http://127.0.0.1:8000`** 으로 둔다. 본 PRD의 모든 API 호출 표기는 이 값으로 통일한다.
- 응답이 `res.ok`가 아니면 body의 `detail`을 파싱하여 사람이 읽을 수 있는 메시지로 변환 후 `throw`한다.
  - `detail`이 문자열이면 그대로 사용 (500 케이스)
  - `detail`이 배열이면 각 항목의 `msg`를 결합 (422 케이스)
  - 파싱 실패 시 `HTTP ${status}` 형태의 기본 메시지 사용
- 네트워크 오류(서버 미실행 등)는 `fetch`가 `TypeError`를 던지므로, "서버에 연결할 수 없습니다" 류의 메시지로 변환한다.

---

## 7. 사용자 Interaction Flow

### 7.1 최초 진입

1. 앱이 마운트된다.
2. 마운트 시점의 `useEffect`(의존성 배열 `[]`)에서 `GET /models`를 호출한다.
   - 이 effect는 **논리적으로 "마운트당 1회"** 실행을 의도한다.
   - 다만 개발 모드의 `<StrictMode>`는 **모든 Effect에 대해 setup + cleanup 사이클을 한 번 더 실행한다**(`setup → cleanup → setup`). 그 결과 **개발 환경에서는 호출이 2회 발생할 수 있다.** 프로덕션 빌드(`npm run build`)에서는 1회만 실행된다.
   - `GET`이며 서버 상태를 바꾸지 않으므로 **중복 호출을 허용한다.** 이를 막기 위한 전역 플래그나 `useRef` 가드를 넣지 않는다.
   - 다만 늦게 도착한 응답이 최신 상태를 덮어쓰지 않도록, effect cleanup에서 결과 반영을 취소한다. **`ignore` 플래그가 기본 해법**이다.

     ```js
     useEffect(() => {
       let ignore = false
       getModels()
         .then(data => { if (!ignore) { /* setModels ... */ } })
         .catch(err => { if (!ignore) { /* setModelsError ... */ } })
       return () => { ignore = true }
     }, [])
     ```

   - `AbortController`로 요청 자체를 취소할 수도 있으나, **그것만으로는 race condition을 막을 수 없다.** fetch 이후에 비동기 단계가 더 이어질 수 있기 때문이며, React 공식 문서도 `ignore` 같은 명시적 플래그를 가장 확실한 방법으로 안내한다. `AbortController`는 쓰더라도 `ignore` 플래그를 **대체하지 않고 병행**한다.
3. 성공: `models` 배열을 select 옵션으로 채우고, 아래 규칙으로 선택값을 정한다.
   - 배열에 **`qwen3.5:9b`가 있으면 그것을 선택**한다 (기본 모델).
   - 없으면 **`models[0]`(첫 번째 항목)으로 폴백**한다. 기본 모델이 설치되지 않은 환경에서도 앱이 동작해야 하기 때문이다.
   - 설계도에 보이는 `gemma3:4b`는 **사용하지 않는다.**
4. 실패, 또는 성공했으나 `models`가 빈 배열인 경우: 아래 7.1.1을 따른다.

#### 7.1.1 모델 목록을 사용할 수 없을 때 (비활성화 규칙)

`modelsError`가 있거나 `models.length === 0`이면 **모델을 특정할 수 없으므로 채팅을 보낼 수 없다.** 따라서 다음을 모두 비활성화한다.

**비활성화하는 요소 (3개뿐)**

| 요소 | 상태 |
| --- | --- |
| 모델 `<select>` | `disabled`, 선택 가능한 option 없음 |
| 채팅 입력 `<textarea>` | `disabled` |
| 전송 버튼 | `disabled` (문구는 idle 문구 `전송` 유지) |
| (Enter 키 전송) | 위 상태의 결과로 동작하지 않음 |

**비활성화하지 않는 요소** (14.1-U16 확정)

| 요소 | 사유 |
| --- | --- |
| **시스템 프롬프트 모드 `<select>`** | Backend와 무관한 로컬 프리셋 선택이다 |
| 시스템 프롬프트 `<textarea>` | 전송과 무관하게 값 조정 가능해야 한다 |
| Temperature / Top P 슬라이더 | 동일 |
| Num Predict 입력 | 동일 |
| `대화 초기화` 버튼 | 로컬 상태만 다룬다 |

- 사이드바에 오류 메시지를 표시한다 (9.2 참조).
- 재시도 버튼은 설계도에 없으므로 추가하지 않는다. 사용자는 Backend/Ollama 실행 후 브라우저를 새로고침한다.

### 7.2 설정 변경

1. 사용자가 모델 select / **프롬프트 모드 select** / 시스템 프롬프트 / Temperature / Top P / Num Predict 중 하나를 변경한다.
2. 해당 상태가 즉시 갱신되고, Temperature·Top P는 라벨의 숫자 표시도 함께 갱신된다.
3. 별도 저장 동작은 없다. 다음 전송 시 요청 본문에 포함된다.

#### 7.2.1 프롬프트 모드 선택 시 동작

| 사용자 동작 | `settings.promptMode` | `settings.systemPrompt` |
| --- | --- | --- |
| 프롬프트 모드 select 변경 | 선택한 모드 키로 **갱신** | `promptModes[key].prompt`로 **덮어씀** |
| 시스템 프롬프트 textarea 수정 | **변경하지 않음 (유지)** | 입력한 문자열로 갱신 |

```js
// 모드 선택: 두 값을 함께 갱신
function handleChangePromptMode(key) {
  setSettings(prev => ({ ...prev, promptMode: key, systemPrompt: promptModes[key].prompt }))
}

// textarea 수정: systemPrompt만 갱신 — promptMode는 건드리지 않는다
function handleChangeSetting(field, value) {
  setSettings(prev => ({ ...prev, [field]: value }))
}
```

> ⚠️ textarea 수정 시 `promptMode`를 초기화하거나 빈 값으로 바꾸지 않는다. select는 "마지막으로 고른 프리셋"을 표시할 뿐이며, textarea 내용과 달라지는 것이 정상이다.

### 7.3 메시지 전송

1. 사용자가 입력 textarea(placeholder: `메시지를 입력하세요.`)에 질문을 입력한다.
2. 다음 중 하나로 전송한다.
   - 전송 버튼(`전송`) 클릭
   - `Enter` 키 입력
   - `Shift` + `Enter`는 전송하지 않고 **줄바꿈**을 삽입한다 (기본 동작 유지)
   - ⚠️ 한글 입력기(IME) 조합 중에 눌리는 `Enter`는 전송으로 처리하지 않는다. `event.nativeEvent.isComposing`이 `true`면 무시한다.
   - 전송이 비활성화된 상태(로딩 중, 모델 목록 사용 불가, 입력값 공백)에서는 `Enter`도 아무 동작을 하지 않는다.
3. 입력값이 공백만 있으면 아무 일도 일어나지 않는다.
4. 사용자 메시지가 즉시 목록 하단에 추가되고, 입력창이 비워진다.
5. 로딩 상태 진입: 전송 버튼 문구가 `응답 생성 중...`으로 바뀌고 버튼과 입력창이 비활성화된다.
6. `POST /chat` 호출.
7. 성공: AI 메시지를 목록 하단에 추가한다.
8. 실패: 에러 메시지를 표시한다. 이미 추가된 사용자 메시지는 목록에 남긴다.
9. 성공/실패와 무관하게 로딩 상태를 해제한다.

### 7.4 대화 초기화

1. 사용자가 헤더의 `대화 초기화` 버튼을 클릭한다.
2. 메시지 목록을 빈 배열로 만들고 에러 상태를 해제한다.
3. 사이드바의 모델 설정 값은 **유지한다** (초기화 대상 아님 — 버튼 위치와 명칭이 "대화" 초기화이므로).
4. 확인 다이얼로그는 설계도에 없으므로 띄우지 않는다.

---

## 8. API 연동 Flow

### 8.1 모델 목록

```
App mount
   └─ useEffect(() => { ... }, [])   // 의존성 배열 빈 값 = 마운트당 1회
        │                            // (개발 모드 StrictMode: setup+cleanup 1회 추가 → 호출 2회 가능)
        └─ getModels()
             ├─ 200 & models.length > 0 → setModels(data.models)
             │                            const DEFAULT_MODEL = "qwen3.5:9b"
             │                            const picked = data.models.includes(DEFAULT_MODEL)
             │                                         ? DEFAULT_MODEL : data.models[0]
             │                            setSettings(prev => ({ ...prev, model: picked }))
             ├─ 200 & models.length === 0 → setModelsError("사용 가능한 모델이 없습니다...")
             └─ err → setModelsError(message)
       finally → setIsModelsLoading(false)
```

> ⚠️ `main.jsx`의 `<StrictMode>` 때문에 **개발 모드에서는 effect가 두 번 실행되어 `/models`가 2회 호출될 수 있다.** `GET`이라 부작용이 없으므로 이는 정상 동작이며, 버그로 오인하거나 가드를 넣어 막지 않는다 (7.1 참조). 프로덕션 빌드에서는 1회만 호출된다.

### 8.2 채팅 전송

```
onSend(text)
   ├─ text.trim() === "" → 중단
   ├─ setMessages([...prev, { role: "user", content: text }])
   ├─ setInput(""), setError(null), setIsLoading(true)
   └─ postChat({
          message: text,
          model: settings.model,
          system_prompt: settings.systemPrompt,
          temperature: settings.temperature,
          top_p: settings.topP,
          num_predict: settings.numPredict,   // system_prompt 는 textarea 현재 값
      })                                        // (promptMode 키는 전송하지 않는다)
        ├─ 200 → setMessages([...prev, {
        │            role: "assistant",
        │            content: data.message,
        │            model: data.model,
        │            elapsedTime: data.elapsed_time,
        │        }])
        └─ err → setError(message)
       finally → setIsLoading(false)
```

### 8.3 요청 본문 필드명 주의

Frontend 상태는 camelCase를 써도 되지만, **요청 본문 키는 반드시 Backend schema의 snake_case와 일치**해야 한다.

| Frontend state (예시) | Request body key (고정) |
| --- | --- |
| `systemPrompt` (textarea 현재 값) | `system_prompt` |
| `promptMode` (선택된 모드 키) | **전송하지 않음** — Backend schema에 없는 필드다 |
| `topP` | `top_p` |
| `numPredict` | `num_predict` |
| `temperature` | `temperature` |
| `model` | `model` |

응답 필드도 동일하게 `elapsed_time`(snake_case)으로 내려온다.

> ⚠️ **`system_prompt`에는 반드시 textarea의 현재 문자열을 담는다.** `settings.promptMode`(`"basic"` 등 모드 키)를 보내면 안 된다. 모드 키는 UI 표시용 로컬 상태일 뿐이며, Backend `ChatRequest`에는 해당 필드가 존재하지 않는다(F-3).

---

## 9. Loading / Error 상태 정의

### 9.1 Loading

| 상태 | 트리거 | UI 반영 |
| --- | --- | --- |
| `isLoading` | `POST /chat` 진행 중 | 전송 버튼 문구 `전송` → `응답 생성 중...`, 버튼 `disabled`, 입력 textarea `disabled` |
| `isModelsLoading` | `GET /models` 진행 중 | 모델 select `disabled`, 입력 textarea · 전송 버튼 `disabled` (버튼 문구는 `전송` 유지) |

전송 가능 여부는 다음 파생 조건으로 판단한다.

```js
const isModelsUnavailable = isModelsLoading || Boolean(modelsError) || models.length === 0
const canSend = !isLoading && !isModelsUnavailable && input.trim() !== "" && isNumPredictValid
```

- 입력 textarea의 `disabled` = `isLoading || isModelsUnavailable`
- 전송 버튼의 `disabled` = `!canSend`

### 9.2 Error

| 상태 | 트리거 | UI 반영 |
| --- | --- | --- |
| `error` | `POST /chat` 실패 (500 / 422 / 네트워크) | **메시지 목록 영역 최하단에 인라인 텍스트로** 오류 노출. 이미 보낸 사용자 메시지는 목록에 유지. 입력창·전송 버튼은 다시 활성화 |
| `modelsError` | `GET /models` 실패, 또는 성공했으나 `models`가 빈 배열 | 사이드바 모델 select 하단에 인라인 텍스트로 오류 노출. **모델 select · 입력 textarea · 전송 버튼을 모두 비활성화**한다 (7.1.1) |

### 9.3 에러 메시지 요구사항

1. Backend의 `detail` 원문을 그대로 노출하지 말고, 사용자에게 읽히는 문장으로 감싼다. 단 원인 파악이 가능하도록 `detail` 내용을 포함한다.
2. 새 요청을 시작할 때 이전 에러는 해제한다.
3. Ollama 미실행 / 모델 미존재가 가장 흔한 실패 원인이므로, 500 응답의 `detail`은 반드시 화면에 표시되어야 한다.
4. `modelsError`는 채팅 자체를 막는 치명적 상태이므로, 오류 문구에 복구 방법(Ollama 및 Backend 실행 여부 확인 후 새로고침)을 함께 안내한다.

---

## 10. 필요한 State

모든 상태는 `App`에서 `useState`로 관리한다. 외부 상태 관리 라이브러리를 도입하지 않는다.

| State | 타입 | 초기값 | 설명 |
| --- | --- | --- | --- |
| `models` | `string[]` | `[]` | `/models` 응답 |
| `isModelsLoading` | `boolean` | `true` | 모델 목록 조회 중 |
| `modelsError` | `string \| null` | `null` | 모델 목록 조회 실패 / 모델 0개 |
| `settings.model` | `string` | `""` → 조회 성공 시 **`qwen3.5:9b`** (없으면 `models[0]`) | 선택된 모델명 |
| `settings.promptMode` | `string` | `"basic"` | 선택된 프리셋 모드 키. **전송하지 않음** |
| `settings.systemPrompt` | `string` | `promptModes.basic.prompt` | 시스템 프롬프트 — **전송되는 값** |
| `settings.temperature` | `number` | `0.4` | 0.0 ~ 2.0 |
| `settings.topP` | `number` | `0.55` | 0.0 ~ 1.0 |
| `settings.numPredict` | `number` | `256` | 1 ~ 2048 |
| `messages` | `Message[]` | `[]` | 대화 목록 |
| `input` | `string` | `""` | 입력창 값 |
| `isLoading` | `boolean` | `false` | `/chat` 진행 중 |
| `error` | `string \| null` | `null` | `/chat` 실패 메시지 |

### 10.1 `Message` 형태

```js
// 사용자 메시지
{ id: string, role: "user", content: string }

// AI 메시지
{ id: string, role: "assistant", content: string, model: string, elapsedTime: number }
```

- `id`는 React `key`용. `crypto.randomUUID()` 또는 증가 카운터를 사용한다(배열 index를 key로 쓰지 않는다).
- `model` / `elapsedTime`은 응답에 포함되어 있으므로 상태에는 보관하되, **화면에는 표시하지 않는다** (14.1-U14 확정).

### 10.2 초기값 확정 근거 (14.1-U7)

| 항목 | 확정 초기값 | 출처 |
| --- | --- | --- |
| `model` | **`qwen3.5:9b`** — `/models` 응답에 있으면 선택, 없으면 `models[0]`으로 폴백 | 사용자 지정 기본 모델 (2026-09-23). 설계도의 `gemma3:4b`는 **사용하지 않는다** |
| `promptMode` | **`basic`** | `promptModes`의 첫 번째 키 (14.1-U15 확정) |
| `systemPrompt` | **`promptModes.basic.prompt`** | 14.1-U15 확정 — 설계도 문구가 아니라 프리셋 원문을 쓴다 |
| `temperature` | `0.4` | 설계도 이미지 |
| `topP` | `0.55` | 설계도 이미지 |
| `numPredict` | `256` | 설계도 이미지 |

> ⚠️ **초기 `systemPrompt`는 설계도 문구가 아니다 (14.1-U15 확정).** 설계도 이미지의 textarea에는 `너는 초보자를 돕는 AI 강사다. 답변은 명확하고 간결하게 작성한다.`가 보이지만, `promptModes.basic.prompt`는 여기에 더해 전문용어 안내와 "출력 형식" 4개 항목을 포함한다. **초기값으로는 `promptModes.basic.prompt`를 사용한다** — select(`기본 설명 모드`)와 textarea 내용이 처음부터 일치하도록 하기 위함이다. 이 한 항목에 한해 14.1-U7(설계도 값 사용)보다 U15가 우선한다.

> ⚠️ 이 값들은 Backend `schema.py`의 기본값(`temperature=0.6`, `top_p=0.7`, `model="exaone3.5:7.8b"`)과 다르다. Frontend는 **항상 6개 필드를 모두 명시해서 전송**하므로 Backend 기본값은 적용되지 않으며, 이는 충돌이 아니다. Backend 기본값을 바꾸지 않는다(F-1).

---

## 11. 필요한 Dependency

### 11.1 현재 설치된 의존성 (이번 작업의 기준)

| 패키지 | `package.json` 범위 | `node_modules` 실제 설치 버전 |
| --- | --- | --- |
| `react` | `^19.2.8` | **19.3.0** |
| `react-dom` | `^19.2.8` | **19.3.0** |
| `vite` (dev) | `^8.3.0` | **8.3.0** |
| `@vitejs/plugin-react` (dev) | `^6.1.1` | **6.1.1** |
| `eslint` 및 플러그인 (dev) | - | 설치됨 |

### 11.2 신규 Dependency

**없다.** 이번 범위에서 신규 패키지를 설치하지 않는다.

| 필요 기능 | 사용할 표준 수단 |
| --- | --- |
| HTTP 호출 | 브라우저 내장 `fetch` (axios 도입 안 함) |
| 상태 관리 | `useState` / `useEffect` (Redux, Zustand 등 도입 안 함) |
| 스타일링 | 플레인 CSS (`App.css`, `index.css`). Tailwind, styled-components 등 도입 안 함 |
| 라우팅 | 불필요 (단일 화면) |
| 프롬프트 프리셋 | **기존 로컬 파일** `src/api/promptMode.js`를 import. 신규 패키지 아님 |
| 마크다운 렌더링 | 도입 안 함 (N-7) |

### 11.3 React 19 관련 구현 유의사항

- 프로젝트는 React 19.3.0이며 `main.jsx`는 `createRoot` + `<StrictMode>` 구성이다. 이 구조를 유지한다.
- `<StrictMode>`는 **개발 모드에서만** 모든 Effect의 setup + cleanup 사이클을 한 번 더 실행하므로(`setup → cleanup → setup`) effect가 2회 실행된다. 프로덕션 빌드(`npm run build`)에서는 1회만 실행된다. `/models` 조회에서 이 중복을 막지 않고 허용하되, cleanup의 `ignore` 플래그로 늦은 응답 반영만 취소한다 (7.1, 8.1 참조).
- 비동기 응답을 상태에 반영할 때는 `AbortController`가 아닌 **`ignore` 플래그를 기본**으로 사용한다. 공식 문서 기준으로 `AbortController` 단독으로는 race condition을 막지 못한다.
- 제어 컴포넌트(`value` + `onChange`) 패턴을 사용한다. `<textarea>`는 children이 아닌 `value` prop으로 값을 준다.
- 함수형 갱신(`setMessages(prev => [...prev, next])`)을 사용해 비동기 응답 처리 시 오래된 상태를 참조하지 않도록 한다.

> ℹ️ **출처:** 위 React 관련 내용은 저장소에 실제 설치된 버전(React 19.3.0)·기존 소스(`main.jsx`, `App.jsx`)를 확인하고, Context7 MCP로 React 공식 문서(`/reactjs/react.dev` — `reference/react/StrictMode.md`, `reference/react/useEffect.md`, `learn/synchronizing-with-effects.md`)를 조회하여 대조했다. StrictMode의 Effect 2회 실행과 `ignore` 플래그 우선 원칙은 공식 문서 기준이다.
>
> (초판 작성 시에는 Context7 MCP를 사용할 수 없어 설치된 코드만으로 작성했고, 이후 도구가 활성화되어 해당 서술을 검증·정정했다.)

---

## 부록 A. 제약 및 기술적 고려사항

### A.1 Backend가 대화 맥락을 기억하지 않는다 (중요)

`backend/ollama_chat.py`는 매 요청마다 다음 두 메시지만 Ollama에 보낸다.

```python
messages=[
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": message},
]
```

따라서:
- 화면의 대화 목록은 **표시 전용 기록**이다.
- 사용자가 "방금 말한 것 다시 설명해줘"라고 보내면 모델은 이전 대화를 알지 못한다.
- 이를 해결하려면 Backend schema 변경이 필요하므로 **이번 범위에서 하지 않는다**(N-3).
- **이와 관련한 안내 문구를 UI에 넣지 않는다** (14.1-U11 확정). 설계도에 없고, 사용자가 넣지 않기로 결정했다.

### A.2 긴 응답 대기

로컬 LLM 추론은 수십 초가 걸릴 수 있다. `fetch`에 타임아웃을 걸지 않는다(기본 동작 유지). 사용자에게는 `응답 생성 중...` 표시로 진행 중임을 알린다.

### A.3 Base URL

`http://127.0.0.1:8000`을 하드코딩하지 말고 상수/환경변수로 한 곳에 모은다. Backend CORS가 `["*"]`이므로 Vite proxy 없이 직접 호출한다.

Backend는 `127.0.0.1`에 바인딩되므로(`uvicorn.run(host="127.0.0.1", ...)`) **표기를 `http://127.0.0.1:8000`으로 통일**한다. 브라우저에서 `localhost`와 `127.0.0.1`은 서로 다른 Origin이지만, Backend CORS가 `["*"]`이므로 어느 쪽으로 호출해도 동작한다. 혼동을 막기 위해 코드·문서 모두 `127.0.0.1`만 사용한다.

### A.4 기존 템플릿 자산 정리

`frontend/src/assets/hero.png`, `react.svg`, `vite.svg`와 `public/icons.svg`는 Vite 템플릿 데모용이며, `App.jsx` 재작성 시 참조가 사라진다.

**이 파일들을 삭제하지 않는다** (14.1 확정). 참조되지 않은 채로 저장소에 그대로 둔다. 번들에는 포함되지 않으므로 기능·빌드에 영향이 없다. `index.html`의 `<title>` 변경만 수행한다.

---

## 12. Acceptance Criteria

### 12.1 레이아웃

- [ ] AC-1. 화면이 좌측 고정 폭 사이드바 + 우측 채팅 영역의 2단으로 표시된다.
- [ ] AC-2. 사이드바 상단에 `모델 설정` 제목이 있다.
- [ ] AC-3. 사이드바에 모델 select, 시스템 프롬프트 textarea, Temperature 슬라이더, Top P 슬라이더, Num Predict 입력이 **이 순서대로** 있다.
- [ ] AC-4. 헤더에 `Local LLM Chat` 제목과 `React + FastAPI + Ollama 기반 로컬 AI 채팅 앱` 부제가 표시된다.
- [ ] AC-5. 헤더 우측에 `대화 초기화` 버튼이 있다.
- [ ] AC-6. 하단에 입력 textarea와 전송 버튼이 가로로 나란히 배치된다.
- [ ] AC-7. 페이지 전체는 스크롤되지 않고, 메시지 영역만 세로 스크롤된다.

### 12.2 모델 목록

- [ ] AC-8. 앱 진입 시 `GET http://127.0.0.1:8000/models`가 호출된다.
- [ ] AC-9. 응답의 `models` 배열이 select의 option으로 렌더링된다.
- [ ] AC-10. 조회 성공 시 **`qwen3.5:9b`가 목록에 있으면 그것이** 기본 선택값이 되고, 없으면 `models[0]`으로 폴백한다.
- [ ] AC-11. `/models` 호출이 실패해도 앱이 흰 화면이 되지 않고, 사이드바에 오류 메시지가 표시된다.
- [ ] AC-12. `/models` 조회 실패 시 또는 `models`가 빈 배열일 때 **모델 select · 입력 textarea · 전송 버튼이 모두 비활성화**된다.
- [ ] AC-13. 위 비활성화 상태에서 `Enter` 키를 눌러도 전송되지 않는다.
- [ ] AC-14. 개발 모드(`npm run dev`)에서 `<StrictMode>`로 인해 `/models`가 2회 호출되더라도 select 옵션이 중복되거나 선택값이 깨지지 않는다.

### 12.3 설정

- [ ] AC-15. Temperature 라벨이 `Temperature: {현재값}` 형식으로 표시되고, 슬라이더 조작 시 즉시 갱신된다.
- [ ] AC-16. Top P 라벨이 `Top P: {현재값}` 형식으로 표시되고, 슬라이더 조작 시 즉시 갱신된다.
- [ ] AC-17. 초기값이 프롬프트 모드 `basic`, 시스템 프롬프트 **`promptModes.basic.prompt` 원문**, Temperature `0.4`, Top P `0.55`, Num Predict `256`으로 설정된다. (초기 textarea 내용은 설계도 문구가 아니다 — 14.1-U15)
- [ ] AC-18. Num Predict 입력이 `type="number"`, `min="1"`, `max="2048"`로 렌더링된다.
- [ ] AC-19. Temperature는 0.0~2.0, Top P는 0.0~1.0, Num Predict는 1~2048 범위를 벗어난 값을 전송할 수 없다.
- [ ] AC-20. 시스템 프롬프트는 여러 줄 입력이 가능하다.

### 12.4 채팅

- [ ] AC-21. 전송 시 `POST http://127.0.0.1:8000/chat`이 호출되고, 요청 본문에 `message`, `model`, `system_prompt`, `temperature`, `top_p`, `num_predict` 6개 키가 **snake_case로** 포함된다.
- [ ] AC-22. 입력 textarea의 placeholder가 `메시지를 입력하세요.`이다.
- [ ] AC-23. 전송 직후 사용자 메시지가 목록에 나타나고 입력창이 비워진다.
- [ ] AC-24. 사용자 말풍선은 우측 정렬, 연한 파란 배경이며 상단에 `사용자` 라벨이 있다.
- [ ] AC-25. AI 말풍선은 **좌측 정렬, 연회색 배경이며 상단에 `AI` 라벨**이 있고, 응답의 줄바꿈이 보존된다.
- [ ] AC-26. `Enter` 키로 전송되고, `Shift` + `Enter`는 줄바꿈이 입력된다.
- [ ] AC-27. 한글 입력기 조합 중 확정을 위해 누른 `Enter`로는 전송되지 않는다.
- [ ] AC-28. 입력값이 비어 있거나 공백만 있으면 요청이 전송되지 않는다.
- [ ] AC-29. 응답 도착 시 메시지 영역이 자동으로 최하단까지 스크롤된다.

### 12.5 로딩 / 에러

- [ ] AC-30. 평상시 전송 버튼 문구가 `전송`이다.
- [ ] AC-31. `/chat` 진행 중 전송 버튼 문구가 `응답 생성 중...`으로 바뀐다.
- [ ] AC-32. `/chat` 진행 중 전송 버튼과 입력 textarea가 비활성화된다.
- [ ] AC-33. 응답 완료(성공/실패) 후 버튼과 입력창이 다시 활성화된다.
- [ ] AC-34. `/chat` 실패 시 오류가 **메시지 목록 영역 최하단에 인라인으로** 표시된다(토스트/모달 아님).
- [ ] AC-35. 500 응답 시 `detail` 문자열이 포함된 오류 메시지가 화면에 표시된다.
- [ ] AC-36. Backend가 꺼져 있을 때(네트워크 오류) 앱이 흰 화면이 되지 않고 오류 메시지를 표시한다.
- [ ] AC-37. `/chat` 실패 후에도 이미 전송된 사용자 메시지가 목록에 남아 있다.

### 12.6 초기화

- [ ] AC-38. `대화 초기화` 클릭 시 메시지 목록이 비워진다.
- [ ] AC-39. `대화 초기화` 후에도 사이드바의 모델/프롬프트/파라미터 값은 유지된다.

### 12.7 제약 준수

- [ ] AC-40. `git diff backend/`의 결과가 비어 있다.
- [ ] AC-41. `frontend/package.json`의 `dependencies` / `devDependencies`가 작업 전과 동일하다.
- [ ] AC-42. `npm run lint`가 통과한다.
- [ ] AC-43. **`npm run build`가 오류 없이 성공한다** (프로덕션 빌드 산출물이 `frontend/dist/`에 생성된다).
- [ ] AC-44. `npm run preview`로 빌드 결과를 실행했을 때도 채팅 송수신이 정상 동작한다.
- [ ] AC-45. 설계도에 없는 기능(마크다운 렌더링, 대화 저장, 메시지 복사 버튼 등)이 **사용자 승인 없이** 추가되지 않았다. (S-10 프롬프트 모드 select는 사용자가 명시적으로 요청한 예외다)

### 12.8 시스템 프롬프트 모드 (S-10)

- [ ] AC-46. 사이드바의 시스템 프롬프트 영역에 `시스템 프롬프트 모드` 라벨과 `<select>`가 있으며, **시스템 프롬프트 textarea 바로 위**에 배치된다.
- [ ] AC-47. select의 option이 `promptModes`의 **5개 모드**로 렌더링되고, 표시 문구는 각 모드의 `label`(`기본 설명 모드` / `강사용 설명 모드` / `코드 멘토 모드` / `오류 해결 모드` / `표 형식 정리 모드`)이며, 순서는 `basic` → `teacher` → `code` → `troubleshoot` → `table`이다.
- [ ] AC-48. 모드를 선택하면 해당 모드의 `prompt` 문자열이 시스템 프롬프트 textarea에 표시된다(기존 내용을 덮어쓴다).
- [ ] AC-49. 모드 선택 후에도 textarea를 자유롭게 수정할 수 있다(읽기 전용이 아니다).
- [ ] AC-50. textarea를 수정해도 **select의 선택값이 유지**된다.
- [ ] AC-51. 전송 시 `system_prompt`에 **textarea의 현재 문자열**이 담기고, 모드 키(`basic` 등)는 요청 본문에 포함되지 않는다.
- [ ] AC-52. `git diff frontend/src/api/promptMode.js`의 결과가 비어 있다(프리셋 데이터 구조 미변경).

---

## 13. 절대 변경하면 안 되는 사항

| # | 항목 | 내용 |
| --- | --- | --- |
| F-1 | Backend 소스 | `backend/main.py`, `backend/schema.py`, `backend/ollama_chat.py`, `backend/pyproject.toml` 등 `backend/` 하위 전체 파일을 수정하지 않는다. |
| F-2 | Endpoint 경로 | `POST /chat`, `GET /models` |
| F-3 | Request schema | `message`, `model`, `system_prompt`, `temperature`, `top_p`, `num_predict` — 이름/타입/범위 |
| F-4 | Response schema | `/chat` → `model`, `message`, `elapsed_time` / `/models` → `models` |
| F-5 | 필드 표기법 | snake_case. camelCase로 보내면 Pydantic이 무시하거나 422를 반환한다. |
| F-6 | Backend Port | `8000` |
| F-7 | CORS 설정 | `backend/main.py`의 `CORSMiddleware` 설정을 고치지 않는다. |
| F-8 | Ollama 엔드포인트 | `http://localhost:11434/api/tags`는 Backend가 호출한다. **Frontend가 Ollama를 직접 호출하지 않는다.** |
| F-9 | 의존성 | 신규 npm 패키지를 설치하지 않는다. |
| F-10 | 진입점 구조 | `frontend/index.html`의 `<div id="root">`와 `main.jsx`의 `createRoot` + `StrictMode` 구조 |
| F-11 | `promptMode.js` 데이터 구조 | `export const promptModes` 객체 형태, 5개 모드 키(`basic`/`teacher`/`code`/`troubleshoot`/`table`), 각 항목의 `{ label, prompt }` 필드. **읽기 전용으로 import 하며 파일을 수정하지 않는다.** 모드 추가·삭제, 키 이름 변경, 배열 변환, default export 전환 모두 금지 |

---

## 14. 미확정 사항 (Open Questions)

### 14.1 확정된 사항

> 이전 버전에서 미확정이었으나 **확정된 결정**이다. 구현은 이 표를 따른다.

| # | 항목 | 확정 내용 | 반영 위치 |
| --- | --- | --- | --- |
| U2 | AI 응답 말풍선 스타일 | **좌측 정렬 / 연회색 배경 / 상단 라벨 `AI`** | 5.4, AC-25 |
| U3 | 전송 버튼의 평상시(idle) 문구 | **`전송`** | 5.5, AC-30 |
| U4 | 입력 textarea의 placeholder | **`메시지를 입력하세요.`** | 5.5, AC-22 |
| U5 | 에러 메시지의 표시 위치와 형태 | **메시지 영역 최하단 인라인 텍스트** (토스트/모달 아님) | 5.4, 9.2, AC-34 |
| U7 | 각 설정값의 초기 기본값 | **설계도 값 사용**: Temperature `0.4`, Top P `0.55`, Num Predict `256`. **모델은 `qwen3.5:9b`**(없으면 `models[0]` 폴백). 시스템 프롬프트는 U15가 우선한다 | 10, 10.2, AC-10 / AC-17 |
| U8 | Enter 키 전송 여부 | **`Enter` = 전송, `Shift`+`Enter` = 줄바꿈** (IME 조합 중 Enter는 무시) | 5.5, 7.3, AC-26 / AC-27 |
| U13 | Num Predict 입력 타입 | **`<input type="number" min="1" max="2048">`**, 유효하지 않으면 전송 버튼 비활성화 | 5.2, AC-18 |
| — | `/models` 실패 시 동작 | **모델 select · 입력 textarea · 전송 버튼을 모두 비활성화**하고 사이드바에 오류 표시 | 7.1.1, 9.2, AC-12 |
| — | Frontend API Base URL 표기 | **`http://127.0.0.1:8000`으로 통일** | 4.1, 6.1, 부록 A.3 |
| — | 시스템 프롬프트 모드 select 도입 | **설계도에 없으나 사용자가 명시 요청하여 범위에 포함**(S-10). `promptMode.js`의 5개 프리셋을 option으로 사용 | 2, 5.2.1 |
| — | 모드 select ↔ textarea 관계 | 모드 선택 시 textarea를 **덮어쓰고**, textarea 수정 시 select 값은 **유지**한다 | 5.2.1, 7.2.1, AC-48 / AC-50 |
| — | `system_prompt` 전송 값 | **textarea의 현재 문자열**을 보낸다. 모드 키는 전송하지 않는다 | 8.3, AC-51 |
| — | `promptMode.js` 취급 | **읽기 전용 import, 구조 변경 금지** | F-11, AC-52 |
| U15 | 앱 최초 진입 시 `promptMode` / `systemPrompt` 초기값 | **`promptMode = "basic"`, `systemPrompt = promptModes.basic.prompt`** — select와 textarea가 처음부터 일치한다. 이 항목은 U7(설계도 값)보다 우선 | 10, 10.2, AC-17 |
| U6 | AI 응답의 마크다운 렌더링 | **하지 않는다.** 줄바꿈만 보존(`white-space: pre-wrap`). 신규 dependency 없음 | 5.4, N-7 |
| U9 | 반응형 / 모바일 레이아웃, 다크 모드, 사이드바 접기 | **범위 밖.** 데스크톱 1280px 기준 단일 레이아웃만 구현 | N-9 |
| U11 | "모델이 이전 대화를 기억하지 못한다" 안내 문구 | **UI에 넣지 않는다** | 부록 A.1 |
| U12 | 메시지 영역이 비어 있을 때 표시할 내용 | **아무것도 표시하지 않는다** (빈 상태 유지). placeholder·안내 문구·예시 질문 등을 넣지 않는다 | 5.4 |
| U14 | AI 말풍선에 `model` / `elapsed_time` 표시 | **표시하지 않는다.** 값은 상태에만 보관 | 5.4, 10.1 |
| U10 | 루트 `README.md`의 CORS 설명 불일치 | **README를 수정하지 않는다.** Frontend는 코드(`allow_origins=["*"]`) 기준으로 동작 | 4.2 |
| — | Vite 템플릿 잔여 asset | **삭제하지 않는다.** `hero.png` / `react.svg` / `vite.svg` / `icons.svg`를 그대로 둔다 | 부록 A.4 |
| — | 기본 모델 | **`qwen3.5:9b`.** `/models`에 있으면 선택, 없으면 `models[0]` 폴백. 설계도의 `gemma3:4b`는 사용하지 않는다 (2026-09-23 사용자 지정) | 7.1, 10.2, AC-10 |
| U16 | `/models` 실패 시 비활성화 범위 | **모델 select · 채팅 입력 textarea · 전송 버튼 3개만** 비활성화한다. 시스템 프롬프트 모드 select, 시스템 프롬프트 textarea, Temperature, Top P, Num Predict는 **계속 조작 가능** | 7.1.1, 9.2, AC-12 |

### 14.2 남은 미확정 사항

**없다.** 모든 항목이 14.1에서 확정되었다 (최종 확정: 2026-09-23).

> 참고: U1(멀티턴 대화)은 Backend가 history를 받지 않아 구조적으로 불가능하므로 미확정이 아니라 **범위 제외**(N-3)로 처리한다. Backend schema 변경 없이는 해결할 수 없다.
