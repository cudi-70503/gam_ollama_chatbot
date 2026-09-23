// 단일 말풍선. role에 따라 정렬/배경/라벨이 달라진다.
// model / elapsed_time 은 상태에만 보관하고 화면에는 표시하지 않는다 (PRD 14.1-U14).
function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`bubble-row ${isUser ? 'is-user' : 'is-assistant'}`}>
      <div className="bubble">
        <span className="bubble-label">{isUser ? '사용자' : 'AI'}</span>
        <p className="bubble-content">{content}</p>
      </div>
    </div>
  )
}

export default MessageBubble
