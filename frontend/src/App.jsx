import { useEffect, useState } from 'react'
import { getModels, postChat } from './api/chatApi'
import { promptModes } from './api/promptMode'
import ChatHeader from './components/ChatHeader'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import SettingsSidebar from './components/SettingsSidebar'
import './App.css'

// 기본 모델. /models 응답에 있으면 선택하고, 없으면 첫 번째 항목으로 폴백한다.
const DEFAULT_MODEL = 'qwen3.5:9b'

const INITIAL_SETTINGS = {
  model: '',
  promptMode: 'basic',
  systemPrompt: promptModes.basic.prompt,
  temperature: 0.4,
  topP: 0.55,
  numPredict: 256,
}

let messageSeq = 0
function nextId() {
  messageSeq += 1
  return `m${messageSeq}`
}

function App() {
  const [models, setModels] = useState([])
  const [isModelsLoading, setIsModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState(null)

  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 마운트 시 모델 목록을 1회 조회한다.
  // 개발 모드 StrictMode 에서는 setup+cleanup 이 한 번 더 돌아 2회 호출될 수 있으나,
  // GET 이라 부작용이 없으므로 막지 않는다. 늦은 응답 반영만 ignore 로 취소한다.
  useEffect(() => {
    let ignore = false

    getModels()
      .then((list) => {
        if (ignore) return
        if (list.length === 0) {
          setModelsError(
            '사용 가능한 모델이 없습니다. Ollama 에 모델을 내려받은 뒤 새로고침해 주세요.',
          )
          return
        }
        setModels(list)
        const picked = list.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : list[0]
        setSettings((prev) => ({ ...prev, model: picked }))
      })
      .catch((err) => {
        if (ignore) return
        setModelsError(
          `${err.message} Ollama 와 Backend 가 실행 중인지 확인한 뒤 새로고침해 주세요.`,
        )
      })
      .finally(() => {
        if (!ignore) setIsModelsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // 설정 변경. 프롬프트 모드 외 항목은 해당 필드만 갱신한다.
  function handleChangeSetting(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  // 프롬프트 모드 선택: 모드와 시스템 프롬프트를 함께 갱신한다.
  // 반대로 textarea 수정 시에는 promptMode 를 건드리지 않는다.
  function handleChangePromptMode(key) {
    setSettings((prev) => ({
      ...prev,
      promptMode: key,
      systemPrompt: promptModes[key].prompt,
    }))
  }

  function handleReset() {
    setMessages([])
    setError(null)
  }

  const numPredict = Number(settings.numPredict)
  const isNumPredictValid =
    settings.numPredict !== '' &&
    Number.isInteger(numPredict) &&
    numPredict >= 1 &&
    numPredict <= 2048

  const isModelsUnavailable =
    isModelsLoading || Boolean(modelsError) || models.length === 0

  const canSend =
    !isLoading &&
    !isModelsUnavailable &&
    input.trim() !== '' &&
    isNumPredictValid

  async function handleSend() {
    const text = input.trim()
    if (!canSend || text === '') return

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: text }])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const data = await postChat({
        message: text,
        model: settings.model,
        systemPrompt: settings.systemPrompt,
        temperature: settings.temperature,
        topP: settings.topP,
        numPredict,
      })
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: data.message,
          model: data.model,
          elapsedTime: data.elapsed_time,
        },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <SettingsSidebar
        models={models}
        settings={settings}
        onChangeSetting={handleChangeSetting}
        onChangePromptMode={handleChangePromptMode}
        modelsDisabled={isModelsUnavailable}
        modelsError={modelsError}
      />

      <main className="main">
        <ChatHeader onReset={handleReset} />
        <MessageList messages={messages} error={error} />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          disabled={isLoading || isModelsUnavailable}
          canSend={canSend}
        />
      </main>
    </div>
  )
}

export default App
