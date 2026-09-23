frontend/docs/design/generate-tasks.md의 지침에 따라 작업해주세요.

기준 PRD:

frontend/docs/design/tasks/prd-frontend-chat.md

UI 설계 기준:

frontend/docs/design/chat_ui_설계도.jpg


## 작업 목표

위 PRD를 기준으로 React Frontend 구현을 위한 Task List를 작성해주세요.

현재 프로젝트에는 동작하는 Backend가 이미 존재하며,
이번 개발 범위는 frontend/ 디렉터리입니다.


## 작업 범위

Frontend 구현에 필요한 Task만 생성해주세요.

다음 작업은 범위에서 제외합니다.

- backend/ 코드 수정
- Backend API endpoint 변경
- Backend Request schema 변경
- Backend Response schema 변경
- 새로운 Backend endpoint 추가
- Backend dependency 변경
- Backend configuration 변경
- Backend refactoring


## Task 생성 원칙

Task는 AI가 한 번에 하나씩 구현하고
사용자가 각 Task 결과를 검토할 수 있을 정도로 작게 나눠주세요.

각 Sub-task는 가능한 한 다음 내용을 명확하게 포함해주세요.

1. 구현 대상
2. 수정 또는 생성할 예상 파일
3. 구현 내용
4. 검증 방법
5. 완료 조건

한 Sub-task에서 너무 많은 Component나 기능을 동시에 구현하지 마세요.

각 Task는 독립적으로 구현하고 검증할 수 있는 크기로 나눠주세요.


## 구현 순서

가능하면 다음 순서로 Task를 구성해주세요.

1. 현재 frontend/ 구조 및 환경 확인
2. React 실행 환경 확인 또는 최소 환경 구성
3. chat_ui_설계도.jpg 기반 전체 Layout 구현
4. 공통 UI Component 구현
5. Chat 관련 Component 구현
6. State 관리 구현
7. Backend API Client 구현
8. 기존 Backend API 연동
9. Loading 상태 구현
10. Error 상태 구현
11. UI 설계도와 구현 결과 비교
12. 전체 기능 검증

단, 실제 PRD와 현재 repository 구조를 우선하여
필요한 경우 순서를 조정해주세요.


## UI 구현 기준

다음 파일을 Frontend UI 구현의 기준으로 사용해주세요.

frontend/docs/design/chat_ui_설계도.jpg

Task List에 반드시 다음 검증 작업을 포함해주세요.

- 설계 이미지와 실제 구현 화면 구조 비교
- 주요 UI Component 배치 확인
- Chat 영역 동작 확인
- 입력 및 버튼 Interaction 확인
- Loading / Error 상태 확인
- Backend API 연동 확인

설계 이미지에서 확인할 수 없는 기능을 임의로 추가하는 Task는 만들지 마세요.

불명확한 사항은 Task에 포함하지 말고
"사용자 확인 필요 사항"으로 별도 기록해주세요.


## Backend API

Backend API 관련 내용은 다음 PRD에 정의된 API Contract를 기준으로 사용해주세요.

frontend/docs/design/tasks/prd-frontend-chat.md

Backend 동작을 Frontend 요구사항에 맞추기 위해 수정하는 Task를 만들지 마세요.

Frontend가 현재 Backend API Contract에 맞춰 동작하도록 Task를 구성해주세요.


## Context7 사용

React 또는 사용하는 Frontend 라이브러리의 API / 사용 패턴 / 권장 방법을 판단해야 하는 경우
Context7을 사용하도록 Task에 명시해주세요.

use context7

현재 프로젝트의 package.json이 존재한다면
해당 파일에 정의된 React 및 라이브러리 버전을 우선 사용해주세요.

버전을 임의로 업그레이드하지 마세요.

새 Dependency가 필요하다고 판단되는 경우
자동으로 설치하도록 Task를 구성하지 마세요.

Dependency 추가는 사용자가 확인할 수 있도록 별도의 Task로 분리해주세요.


## 중요 제약사항

현재 단계에서는 다음 작업을 하지 마세요.

- React 코드 수정
- frontend/ 파일 생성 또는 수정
- backend/ 파일 수정
- package 설치
- Dependency 설치
- 실제 구현 시작

현재 단계에서는 Task List만 작성해주세요.


## 결과 저장 위치

Task List를 다음 위치에 저장해주세요.

frontend/docs/design/tasks/tasks-frontend-chat.md


## 작업 종료 조건

Task List를 생성한 뒤 작업을 종료해주세요.

아직 구현을 시작하지 마세요.

완료 후 다음 내용만 보고해주세요.

### 생성 결과
- 생성한 Task List 파일 경로
- 전체 Parent Task 개수
- 전체 Sub-task 개수

### Dependency
- 추가 검토가 필요한 Dependency가 있는지
- 있다면 어떤 Dependency인지

### 사용자 확인 필요 사항
- 구현 전에 판단이 필요한 사항

### 첫 번째 구현 Task
- Task 번호
- Task 이름