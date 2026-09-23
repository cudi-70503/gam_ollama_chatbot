@frontend/docs/design/create-prd.md 를 사용해주세요.

현재 프로젝트에는 동작하는 Backend가 이미 존재합니다.
이번 작업의 목표는 기존 Backend를 그대로 유지하면서
React 기반 Frontend만 개발하는 것입니다.

Frontend 화면 설계 기준은 다음 파일입니다.

@frontend/docs/design/chat_ui_설계도.jpg

중요한 제약사항:
- backend/ 코드는 수정하지 않습니다.
- Backend API endpoint / Request / Response schema를 변경하지 않습니다.
- frontend/만 이후 구현 대상입니다.
- 현재 단계에서는 코드를 작성하거나 수정하지 않습니다.
- package 설치도 하지 않습니다.
- 설계 이미지에 없는 기능을 임의로 추가하지 않습니다.

PRD 작성 전에 현재 repository를 분석하여 다음을 확인해주세요.

1. 전체 프로젝트 구조
2. backend/의 API endpoint
3. 각 API의 HTTP Method
4. Request / Response schema
5. Backend base URL 및 port
6. CORS 관련 설정
7. frontend/의 현재 상태
8. frontend/docs/design/chat_ui_설계도.jpg의 UI 구조

Backend 분석은 Frontend가 사용할 API Contract를 파악하기 위한 목적으로만 수행해주세요.

UI 설계 이미지를 분석하여 다음을 정리해주세요.

- 전체 Layout
- Header / Sidebar 등 주요 영역
- Chat 영역
- Message 영역
- Input 영역
- Button
- Model 선택 UI가 있다면 해당 영역
- 각 Component의 역할
- 사용자 Interaction
- Loading / Error 상태가 필요한 위치

이미지에서 확인할 수 없는 내용은 추측하지 말고
"미확정 사항"으로 표시해주세요.

React 및 관련 라이브러리의 API / 사용법을 확인해야 하는 경우
Context7을 사용해주세요.

use context7

현재 프로젝트에 설치된 라이브러리가 있다면
해당 버전을 우선 기준으로 사용해주세요.

현재 단계에서는 새로운 dependency를 설치하지 마세요.

PRD에는 다음 내용을 포함해주세요.

1. 프로젝트 목적
2. 개발 범위
3. 개발 제외 범위
4. 기존 Backend API Contract
5. UI 설계도 기반 화면 구조
6. React Component 후보와 책임
7. 사용자 Interaction Flow
8. API 연동 Flow
9. Loading / Error 상태
10. 필요한 State
11. 필요한 Dependency
12. Acceptance Criteria
13. 절대 변경하면 안 되는 사항
14. 미확정 사항

결과는 다음 파일에 저장해주세요.

frontend/docs/design/tasks/prd-frontend-chat.md

PRD를 작성한 뒤 작업을 종료해주세요.

아직 React 코드를 구현하지 마세요.
Task List도 생성하지 마세요.

마지막에는 다음만 보고해주세요.

- 생성한 PRD 파일 경로
- 파악한 Backend API 목록
- 미확정 사항