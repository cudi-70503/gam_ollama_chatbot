frontend/docs/design/process-task-list.md의 지침에 따라 작업해주세요.

기준 문서:

frontend/docs/design/tasks/prd-frontend-chat.md
frontend/docs/design/tasks/tasks-frontend-chat.md
frontend/docs/design/chat_ui_설계도.jpg

## 사용자 확인 사항 확정

Task List의 "사용자 확인 필요 사항"은 다음과 같이 확정합니다.

1. 앱 최초 진입 시 시스템 프롬프트
   - promptMode = "basic"
   - systemPrompt = promptModes.basic.prompt
   - select와 textarea가 처음부터 일치하도록 합니다.

2. /models 조회 실패 시
   - 시스템 프롬프트 모드 select는 비활성화하지 않습니다.
   - 시스템 프롬프트 textarea / Temperature / Top P / Num Predict도 계속 수정 가능합니다.
   - 모델 select / 채팅 입력 textarea / 전송 버튼만 비활성화합니다.

3. 나머지 미확정 사항
   - Markdown 렌더링하지 않음
   - 반응형 / 모바일 / 다크모드는 범위 밖
   - 모델이 이전 대화를 기억하지 못한다는 별도 UI 안내는 추가하지 않음
   - 최초 메시지 영역은 빈 상태로 유지
   - AI 메시지에 model / elapsed_time은 표시하지 않음

4. Vite 템플릿 잔여 asset은 삭제하지 않습니다.
   - 현재 기능과 관계없는 파일은 불필요하게 수정하지 않습니다.
   - index.html title 변경은 Task에 따라 수행할 수 있습니다.

5. README의 CORS 설명은 이번 작업에서 수정하지 않습니다.

## 구현 원칙

- backend/는 어떠한 경우에도 수정하지 않습니다.
- frontend/src/api/promptMode.js는 읽기 전용입니다.
- frontend/package.json의 dependency를 변경하지 않습니다.
- 신규 dependency를 설치하지 않습니다.
- 한 번에 하나의 Sub-task만 수행합니다.
- 현재 Task와 관계없는 리팩토링은 하지 않습니다.
- Task List에서 Context7 사용이 지정된 Task는 구현 전에 반드시 Context7을 사용합니다.
- Task 완료 후 검증까지 성공해야 해당 체크박스를 완료 처리합니다.
- 다음 Task를 자동으로 시작하지 않습니다.

## 현재 수행할 Task

Task 0.1

Task 0.1만 수행해주세요.

완료 후 다음 형식으로 보고하고 작업을 중단해주세요.

### 완료 Task
- Task 번호:
- 완료 여부:

### 변경 사항
- 변경된 파일 / Git 상태:

### 검증
- 수행한 검증:
- 결과:

### Context7
- 사용 여부:
- 사용하지 않았다면 이유:

### 발견한 문제
- 없음 / 내용:

### 다음 Task
- Task 번호:
- Task 이름:

다음 Task는 수행하지 말고 사용자 승인을 기다려주세요.