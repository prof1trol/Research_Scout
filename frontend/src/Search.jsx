import { useState } from 'react'
import { Search, Info, Clock3, LoaderCircle, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import './Search.css'

const categories = [
  { id: '1', title: 'IT и цифровой хаос', description: 'Сбои ПО, утечки данных и технологические катастрофы', query: 'major software outages data breaches technology failures unusual incidents' },
  { id: '2', title: 'Политика и государственный абсурд', description: 'Необычные решения правительств и бюрократические ошибки', query: 'unusual government decisions bureaucratic failures political absurdity' },
  { id: '3', title: 'Маленький человек против системы', description: 'Люди против корпораций и институтов', query: 'individuals winning legal battles against corporations institutions' },
  { id: '4', title: 'Тупые активисты', description: 'Протесты и акции с неожиданными последствиями', query: 'controversial activism protests unexpected consequences news' },
  { id: '5', title: 'Домашние животные', description: 'Питомцы, устроившие хаос', query: 'funny unusual domestic pet incidents news' },
  { id: '6', title: 'Необычные животные и дикая природа', description: 'Необычное поведение животных', query: 'unusual wildlife behavior rare animal discoveries news' },
  { id: '7', title: 'Исторические гигачады прошлого', description: 'Исторические личности, командиры и инженерные достижения', query: 'remarkable historical leaders commanders engineering achievements' },
  { id: '8', title: 'Геополитика и международный цинизм', description: 'Внешняя политика и брошенные союзники', query: 'geopolitics international relations abandoned allies foreign policy analysis' },
  { id: '9', title: 'Игровая индустрия и нишевые легенды', description: 'Игровые скандалы, MMORPG и необычные истории', query: 'gaming industry controversies MMORPG unusual gaming history' },
]

export default function SearchPage({ apiBase, onSourcesUpdated }) {
  const [category, setCategory] = useState('1')
  const [mode, setMode] = useState('category')
  const [customQuery, setCustomQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [results, setResults] = useState([])
  const [searchedQuery, setSearchedQuery] = useState('')

  async function submit(event) {
    event.preventDefault()
    const selected = categories.find(item => item.id === category)
    const query = mode === 'category' ? selected?.query : customQuery.trim()
    if (!query) return
    setLoading(true); setError(''); setNotice(''); setResults([]); setSearchedQuery(query)
    try {
      const response = await fetch(`${apiBase}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({choice: selected.id, query, limit }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.detail || `Ошибка API: HTTP ${response.status}`)
      const found = Array.isArray(data.results) ? data.results : []
      setResults(found)
      setNotice(`Поиск завершён. Найдено: ${data.found ?? found.length}; сохранено в базе: ${data.saved ?? 'не указано'}.`)
    } catch (err) {
      setError(`${err.message}. Проверь, запущен ли backend и доступен ли ${apiBase}.`)
    } finally { setLoading(false) }
  }

  return <section className="page-panel search-page">
    <div className="page-heading"><div><p className="eyebrow">RESEARCH PIPELINE / 02</p><h1>Поиск источников</h1><p className="page-description">Выбери тематику или задай собственный запрос. Результаты отправляются в API и сохраняются в базе данных.</p></div><div className="page-icon"><Search size={22}/></div></div>
    <form className="search-form" onSubmit={submit}>
      <div className="mode-switch"><button type="button" className={mode === 'category' ? 'selected' : ''} onClick={() => { setMode('category'); setError(''); setNotice('') }}>Готовая тематика</button><button type="button" className={mode === 'custom' ? 'selected' : ''} onClick={() => { setMode('custom'); setError(''); setNotice('') }}>Свой запрос</button></div>
      {mode === 'category' ? <div className="category-grid">{categories.map(item => <button type="button" key={item.id} className={`category-card ${category === item.id ? 'selected' : ''}`} onClick={() => setCategory(item.id)}><span className="category-number">{item.id.padStart(2, '0')}</span><span className="category-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="category-radio"/></button>)}</div> : <label className="field-label">Поисковый запрос<textarea value={customQuery} onChange={e => setCustomQuery(e.target.value)} placeholder="Например: крупные сбои цифровой инфраструктуры в Европе" required rows={3}/><small>Запрос передаётся в локальный поисковый API.</small></label>}
      <div className="search-controls"><label className="limit-field">Количество результатов<select value={limit} onChange={e => setLimit(Number(e.target.value))}><option value={5}>5 результатов</option><option value={10}>10 результатов</option><option value={15}>15 результатов</option><option value={20}>20 результатов</option></select></label><span className="search-note"><Info size={15}/> Поиск выполняется через подключённый backend.</span><button className="primary-button" type="submit" disabled={loading || (mode === 'custom' && !customQuery.trim())}>{loading ? <><LoaderCircle className="spin" size={16}/> Ищем…</> : <><Search size={16}/> Запустить поиск</>}</button></div>
    </form>
    {error && <div className="search-alert error-alert" role="alert"><AlertCircle size={18}/><div><strong>Поиск не выполнен</strong><p>{error}</p><button className="text-button" type="button" onClick={submit}>Повторить запрос</button></div></div>}
    {notice && <div className="search-alert success-alert" role="status"><CheckCircle2 size={18}/><div><strong>{notice}</strong><p>Запрос: {searchedQuery}</p><button className="text-button" type="button" onClick={onSourcesUpdated}>Открыть сохранённые источники</button></div></div>}
    {loading && <div className="results-state"><LoaderCircle className="spin" size={24}/><strong>Идёт поиск</strong><p>Запрос отправлен в backend. Это может занять несколько секунд.</p></div>}
    {!loading && results.length > 0 && <section className="results-section"><div className="results-heading"><div><p className="eyebrow">SEARCH OUTPUT</p><h2>Результаты поиска</h2></div><span>{results.length} источников</span></div><div className="result-list">{results.map((item, index) => { const url = item.url || item.link || ''; let host = 'Источник'; try { host = new URL(url).hostname.replace(/^www\./, '') } catch {} return <article className="result-card" key={url || `${item.title}-${index}`}><div className="result-index">{String(index + 1).padStart(2, '0')}</div><div className="result-copy"><span className="result-host">{host}</span><h3>{item.title || 'Без названия'}</h3><p>{item.snippet || item.content || 'Описание не предоставлено поисковым источником.'}</p>{url && <a href={url} target="_blank" rel="noreferrer">Открыть публикацию <ExternalLink size={13}/></a>}</div></article> })}</div></section>}
    {!loading && !error && results.length === 0 && !notice && <div className="placeholder-results"><div className="placeholder-icon"><Clock3 size={20}/></div><div><strong>Результаты появятся здесь</strong><p>Выбери тематику или введи запрос и нажми «Запустить поиск».</p></div></div>}
  </section>
}
