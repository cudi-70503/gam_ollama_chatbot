// 상단 헤더. 제목/부제와 "대화 초기화" 버튼을 보여준다.
function ChatHeader({ onReset }) {
  return (
    <header className="header-card">
      <div className="header-titles">
        <h1 className="header-title">Local LLM Chat</h1>
        <p className="header-subtitle">
          React + FastAPI + Ollama 기반 로컬 AI 채팅 앱
        </p>
      </div>
      <button type="button" className="reset-button" onClick={onReset}>
        대화 초기화
      </button>
    </header>
  )
}

export default ChatHeader
