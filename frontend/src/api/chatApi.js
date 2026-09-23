// Backend API 클라이언트.
// Base URL 은 이곳에서만 정의한다. 호출부에 URL 을 하드코딩하지 않는다.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

// Backend 의 에러 응답을 사람이 읽을 수 있는 한 줄 메시지로 정규화한다.
//  - 500: detail 이 문자열
//  - 422: detail 이 배열 (각 항목의 msg 를 결합)
async function toErrorMessage(response, fallback) {
  try {
    const data = await response.json()
    const detail = data?.detail

    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(', ')
      if (messages) return `입력값이 올바르지 않습니다: ${messages}`
    }
  } catch {
    // JSON 이 아니거나 본문이 비어 있으면 아래 기본 메시지를 쓴다.
  }
  return `${fallback} (HTTP ${response.status})`
}

// fetch 자체가 실패하면(서버 미실행 등) TypeError 가 발생한다.
function toNetworkError(error, hint) {
  if (error instanceof TypeError) {
    return new Error(
      `서버에 연결할 수 없습니다. ${hint} (${BASE_URL})`,
    )
  }
  return error
}

// GET /models -> 모델명 문자열 배열
export async function getModels() {
  let response
  try {
    response = await fetch(`${BASE_URL}/models`)
  } catch (error) {
    throw toNetworkError(error, 'Backend 가 실행 중인지 확인해 주세요.')
  }

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, '모델 목록을 불러오지 못했습니다.'))
  }

  const data = await response.json()
  return data.models ?? []
}

// POST /chat
// 요청 본문 키는 Backend schema 의 snake_case 와 정확히 일치해야 한다.
// 타임아웃을 걸지 않는다 — 로컬 LLM 은 수십 초가 걸릴 수 있다.
export async function postChat({
  message,
  model,
  systemPrompt,
  temperature,
  topP,
  numPredict,
}) {
  let response
  try {
    response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        model,
        system_prompt: systemPrompt,
        temperature,
        top_p: topP,
        num_predict: numPredict,
      }),
    })
  } catch (error) {
    throw toNetworkError(error, 'Backend 가 실행 중인지 확인해 주세요.')
  }

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, '응답 생성에 실패했습니다.'))
  }

  return response.json()
}
