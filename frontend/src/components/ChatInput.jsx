// 하단 입력 영역. Enter = 전송, Shift+Enter = 줄바꿈.
function ChatInput({ value, onChange, onSend, isLoading, disabled, canSend }) {
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    // Shift+Enter 는 줄바꿈이므로 기본 동작에 맡긴다.
    if (e.shiftKey) return
    // 한글 입력기 조합 중 확정을 위해 누른 Enter 는 전송으로 처리하지 않는다.
    if (e.nativeEvent.isComposing) return

    e.preventDefault()
    if (canSend) onSend()
  }

  return (
    <footer className="input-card">
      <textarea
        className="chat-input"
        rows={3}
        placeholder="메시지를 입력하세요."
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="send-button"
        disabled={!canSend}
        onClick={onSend}
      >
        {isLoading ? '응답 생성 중...' : '전송'}
      </button>
    </footer>
  )
}

export default ChatInput
