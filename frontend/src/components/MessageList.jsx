import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

// 메시지 목록. 새 메시지나 에러가 생기면 최하단으로 스크롤한다.
// 목록이 비어 있으면 아무것도 표시하지 않는다 (PRD 14.1-U12).
function MessageList({ messages, error }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, error])

  return (
    <section className="message-area">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}

      {error && <p className="chat-error">{error}</p>}

      <div ref={bottomRef} />
    </section>
  )
}

export default MessageList
