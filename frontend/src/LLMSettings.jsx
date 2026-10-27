import { useEffect, useState } from 'react'
import { Server, CheckCircle2, Save, Wifi, Info, ShieldCheck, RotateCcw, AlertCircle, LoaderCircle } from 'lucide-react'
import './LLMSettings.css'

const STORAGE_KEY = 'research-scout-llm-settings'
const DEFAULTS = { provider: 'docker', model: 'ai/mistral:7B-Q4_0', baseUrl: 'http://model-runner.docker.internal/engines/v1', apiKey: '' }
function readSettings() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return saved ? { ...DEFAULTS, ...saved } : DEFAULTS } catch { return DEFAULTS }
}

export default function LLMSettings({ apiBase }) {
  const [settings, setSettings] = useState(readSettings)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('info')
  const [testing, setTesting] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (saved?.savedAt) setSavedAt(saved.savedAt) } catch {} }, [])

  function update(field, value) { setSettings(prev => ({ ...prev, [field]: value })); setNotice('') }
  function chooseProvider(provider) {
    const values = provider === 'docker' ? { model: DEFAULTS.model, baseUrl: DEFAULTS.baseUrl } : provider === 'lmstudio' ? { model: 'local-model', baseUrl: 'http://host.docker.internal:1234/v1' } : { model: '', baseUrl: '' }
    setSettings(prev => ({ ...prev, provider, ...values })); setNotice('')
  }
  function save(event) {
    event.preventDefault()
    const timestamp = new Date().toISOString()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, savedAt: timestamp }))
      setSavedAt(timestamp); setNoticeType('success'); setNotice('Настройки сохранены в браузере на этом компьютере. Backend пока не получает эту конфигурацию.')
    } catch { setNoticeType('error'); setNotice('Не удалось сохранить настройки в браузере. Проверь доступность localStorage.') }
  }
  async function testConnection() {
    setTesting(true); setNotice('')
    try {
      // The browser calls the app backend; it does not try to reach Docker hostnames directly.
      const response = await fetch(`${apiBase}/api/llm/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: settings.provider, model: settings.model, base_url: settings.baseUrl, api_key: settings.apiKey || null }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`)
      setNoticeType('success'); setNotice(data.message || 'Backend подтвердил подключение к LLM.')
    } catch (err) {
      setNoticeType('error')
      setNotice(err.message.includes('404') ? 'Endpoint /api/llm/test ещё не реализован в backend. Когда добавишь его, кнопка начнёт проверять реальное подключение.' : `Проверка не пройдена: ${err.message}. Убедись, что backend запущен и endpoint /api/llm/test реализован.`)
    } finally { setTesting(false) }
  }
  function reset() { setSettings(DEFAULTS); setNotice(''); setNoticeType('info') }
  const formattedSavedAt = savedAt ? new Date(savedAt).toLocaleString() : ''

  return <section className="page-panel llm-page">
    <div className="page-heading"><div><p className="eyebrow">SYSTEM CONFIGURATION / 03</p><h1>Настройки LLM</h1><p className="page-description">Выбери локальный движок, укажи модель и сохрани параметры. Значения сохраняются в браузере; для применения на backend потребуется API-интеграция.</p></div><div className="page-icon"><Server size={22}/></div></div>
    <form className="llm-form" onSubmit={save}>
      <section className="settings-section"><div className="section-title"><span className="section-step">01</span><div><h2>Провайдер</h2><p>Выбери движок, который будет обслуживать запросы</p></div></div>
        <div className="provider-grid">
          <button type="button" className={`provider-card ${settings.provider === 'docker' ? 'selected' : ''}`} onClick={() => chooseProvider('docker')}><span className="provider-mark docker-mark">D</span><span className="provider-info"><strong>Docker Model Runner</strong><small>Текущая конфигурация проекта</small></span><span className="provider-check">{settings.provider === 'docker' && <CheckCircle2 size={18}/>}</span></button>
          <button type="button" className={`provider-card ${settings.provider === 'lmstudio' ? 'selected' : ''}`} onClick={() => chooseProvider('lmstudio')}><span className="provider-mark lm-mark">LM</span><span className="provider-info"><strong>LM Studio</strong><small>Локальный OpenAI-compatible API</small></span><span className="provider-check">{settings.provider === 'lmstudio' && <CheckCircle2 size={18}/>}</span></button>
          <button type="button" className={`provider-card ${settings.provider === 'custom' ? 'selected' : ''}`} onClick={() => chooseProvider('custom')}><span className="provider-mark custom-mark"><Server size={18}/></span><span className="provider-info"><strong>Другой endpoint</strong><small>Совместимый API-сервер</small></span><span className="provider-check">{settings.provider === 'custom' && <CheckCircle2 size={18}/>}</span></button>
        </div>
      </section>
      <section className="settings-section"><div className="section-title"><span className="section-step">02</span><div><h2>Подключение</h2><p>Параметры API выбранного движка</p></div></div>
        <label className="llm-field"><span>Base URL <b>*</b></span><input type="url" value={settings.baseUrl} onChange={e => update('baseUrl', e.target.value)} placeholder="http://host.docker.internal:1234/v1" required/><small>Адрес должен быть доступен именно backend-контейнеру. Это не обязательно тот же адрес, который открывается в браузере.</small></label>
        <label className="llm-field"><span>Model ID <b>*</b></span><input value={settings.model} onChange={e => update('model', e.target.value)} placeholder="Идентификатор загруженной модели" required/><small>Для Docker Model Runner по умолчанию используется ai/mistral:7B-Q4_0.</small></label>
        <label className="llm-field"><span>API Key <em>необязательно</em></span><input type="password" autoComplete="new-password" value={settings.apiKey} onChange={e => update('apiKey', e.target.value)} placeholder="Оставь пустым, если ключ не нужен"/><small>Ключ сохраняется локально в браузере. Не используй здесь секреты на общедоступном компьютере.</small></label>
      </section>
      <div className="llm-info"><Info size={17}/><p>Настройки можно редактировать и сохранять уже сейчас. Для проверки соединения нужен backend endpoint <code>POST /api/llm/test</code>; он вызывается кнопкой ниже, но должен быть реализован на сервере.</p></div>
      {notice && <div className={`llm-notice llm-notice-${noticeType}`} role={noticeType === 'error' ? 'alert' : 'status'}>{noticeType === 'error' ? <AlertCircle size={17}/> : noticeType === 'success' ? <CheckCircle2 size={17}/> : <Info size={17}/>}<span>{notice}</span></div>}
      <div className="llm-actions"><button className="secondary-button" type="button" onClick={testConnection} disabled={testing || !settings.baseUrl || !settings.model}>{testing ? <><LoaderCircle className="spin" size={16}/> Проверяем…</> : <><Wifi size={16}/> Проверить подключение</>}</button><button className="secondary-button" type="button" onClick={reset}><RotateCcw size={16}/> Сбросить</button><button className="primary-button" type="submit"><Save size={16}/> Сохранить настройки</button></div>
      <div className="settings-footer"><span><ShieldCheck size={15}/> Сохранение в localStorage этого браузера</span>{formattedSavedAt && <span>Последнее сохранение: {formattedSavedAt}</span>}</div>
    </form>
  </section>
}
