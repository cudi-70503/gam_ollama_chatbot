import { promptModes } from '../api/promptMode'

// 좌측 "모델 설정" 사이드바.
// 상태는 소유하지 않고 App이 내려준 props만 사용한다.
function SettingsSidebar({
  models,
  settings,
  onChangeSetting,
  onChangePromptMode,
  modelsDisabled,
  modelsError,
}) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">모델 설정</h2>

      <div className="field">
        <label className="field-label" htmlFor="model-select">
          모델
        </label>
        <select
          id="model-select"
          className="field-control"
          value={settings.model}
          disabled={modelsDisabled}
          onChange={(e) => onChangeSetting('model', e.target.value)}
        >
          {models.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {modelsError && <p className="field-error">{modelsError}</p>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="prompt-mode-select">
          시스템 프롬프트 모드
        </label>
        <select
          id="prompt-mode-select"
          className="field-control"
          value={settings.promptMode}
          onChange={(e) => onChangePromptMode(e.target.value)}
        >
          {Object.entries(promptModes).map(([key, mode]) => (
            <option key={key} value={key}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="system-prompt">
          시스템 프롬프트
        </label>
        <textarea
          id="system-prompt"
          className="field-control system-prompt"
          rows={5}
          value={settings.systemPrompt}
          onChange={(e) => onChangeSetting('systemPrompt', e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="temperature">
          Temperature: {settings.temperature}
        </label>
        <input
          id="temperature"
          className="field-range"
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={settings.temperature}
          onChange={(e) =>
            onChangeSetting('temperature', Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="top-p">
          Top P: {settings.topP}
        </label>
        <input
          id="top-p"
          className="field-range"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.topP}
          onChange={(e) => onChangeSetting('topP', Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="num-predict">
          Num Predict
        </label>
        <input
          id="num-predict"
          className="field-control"
          type="number"
          min="1"
          max="2048"
          value={settings.numPredict}
          onChange={(e) => onChangeSetting('numPredict', e.target.value)}
        />
      </div>
    </aside>
  )
}

export default SettingsSidebar
