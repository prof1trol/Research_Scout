import { useEffect, useMemo, useState } from 'react'
import { Search, Bookmark, Play, ExternalLink, Check, X, LayoutDashboard, SlidersHorizontal, Server, RefreshCw } from 'lucide-react'
import SearchPage from './Search.jsx'
import LLMSettings from './LLMSettings.jsx'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export default function App() {
  const [activePage, setActivePage] = useState('sources')
  const [stories, setStories] = useState([])
  const [view, setView] = useState('All stories')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalSources, setTotalSources] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const pageSize = 25

  useEffect(() => { setPage(0) }, [view])

  useEffect(() => {
    let cancelled = false
    async function loadSources() {
      setLoading(true); setError('')
      const status = view === 'Saved' ? 'Saved' : 'all'
      try {
        const response = await fetch(`${API_BASE}/api/sources?status=${encodeURIComponent(status)}&limit=${pageSize}&offset=${page * pageSize}`)
        if (!response.ok) throw new Error(`API вернул HTTP ${response.status}`)
        const data = await response.json()
        if (cancelled) return
        const sources = Array.isArray(data.sources) ? data.sources : []
        setTotalSources(Number(data.total ?? sources.length))
        setStories(sources.map(source => {
          let hostname = 'Неизвестный источник'
          try { hostname = new URL(source.url).hostname.replace(/^www\./, '') } catch {}
          return { id: source.url, title: source.title || 'Без названия', topic: source.topic || 'БЕЗ КАТЕГОРИИ', source: hostname, summary: source.snippet || 'Описание отсутствует.', status: source.status === 'found' ? 'New' : source.status, url: source.url }
        }))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Не удалось подключиться к API.')
      } finally { if (!cancelled) setLoading(false) }
    }
    loadSources()
    return () => { cancelled = true }
  }, [page, view, refreshKey])

  const savedCount = stories.filter(s => s.status === 'Saved').length
  const reviewCount = stories.filter(s => ['New', 'found'].includes(s.status)).length
  const visible = useMemo(() => stories.filter(s => {
    const matchesView = view === 'Saved' ? s.status === 'Saved' : s.status !== 'Rejected'
    return matchesView && `${s.title} ${s.topic} ${s.summary} ${s.source}`.toLowerCase().includes(query.toLowerCase())
  }), [stories, view, query])

  async function updateStory(id, status) {
    const story = stories.find(s => s.id === id)
    if (!story) return
    try {
      setNotice('Обновление статуса…')
      const response = await fetch(`${API_BASE}/api/sources/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: story.url, status }) })
      if (!response.ok) {
        let detail = `HTTP ${response.status}`
        try { detail = (await response.json()).detail || detail } catch {}
        throw new Error(detail)
      }
      setStories(prev => prev.map(s => s.id === id ? { ...s, status: status === 'found' ? 'New' : status } : s))
      setNotice('Статус источника обновлён.')
    } catch (err) { setNotice(`Не удалось обновить статус: ${err.message}`) }
  }

  return <div className="app-shell">
    <header className="header">
      <button className="brand brand-button" onClick={() => setActivePage('sources')} aria-label="На главную">
        <span className="brand-mark">R</span><span className="brand-copy"><strong>Research Scout</strong><small>LOCAL INTELLIGENCE WORKSPACE</small></span>
      </button>
      <div className={`connection ${error ? 'connection-error' : loading ? 'connection-loading' : 'connection-ok'}`}><span className="connection-dot" />{loading ? 'ПОДКЛЮЧЕНИЕ' : error ? 'API НЕДОСТУПЕН' : 'LOCAL API CONNECTED'}</div>
    </header>

    <nav className="main-nav" aria-label="Главная навигация">
      <button className={activePage === 'sources' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('sources')}><LayoutDashboard size={17}/> Источники</button>
      <button className={activePage === 'search' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('search')}><Search size={17}/> Поиск</button>
      <button className={activePage === 'llm' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('llm')}><Server size={17}/> Настройки LLM</button>
    </nav>

    {activePage === 'sources' ? <>
      <section className="welcome"><div><p className="eyebrow">RESEARCH PIPELINE / 01</p><h1>Найди историю за сигналом.</h1><p className="subtitle">Собирай источники, отбирай важное и превращай находки в исследование.</p></div><button className="primary-button welcome-action" onClick={() => setActivePage('search')}><Search size={16}/> Новый поиск</button></section>
      <section className="stats">
        <div className="stat"><span className="stat-label">ЗАГРУЖЕНО НА ЭТОЙ СТРАНИЦЕ</span><strong>{stories.length}</strong><small>Источники из API</small></div>
        <div className="stat"><span className="stat-label">СОХРАНЕНО</span><strong>{savedCount}</strong><small>В текущей выборке</small></div>
        <div className="stat"><span className="stat-label">НА РАССМОТРЕНИИ</span><strong>{reviewCount}</strong><small>Новые источники</small></div>
      </section>
      <section className="workspace">
        <div className="toolbar"><div className="tabs">{['All stories', 'Saved'].map(tab => <button key={tab} className={`tab ${view === tab ? 'active' : ''}`} onClick={() => setView(tab)}>{tab === 'Saved' && <Bookmark size={15}/>}{tab === 'All stories' ? 'Все источники' : 'Сохранённые'}</button>)}</div><div className="toolbar-right"><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по источникам…"/></label><button className="icon-button" onClick={() => setRefreshKey(v => v + 1)} title="Обновить список" aria-label="Обновить список"><RefreshCw size={16}/></button></div></div>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Закрыть уведомление"><X size={14}/></button></div>}
        {loading && <div className="state-panel"><span className="spinner"/><strong>Загружаем источники</strong><p>Получаем данные из локального API.</p></div>}
        {!loading && error && <div className="state-panel state-error"><strong>Не удалось загрузить источники</strong><p>{error}</p><button className="secondary-button" onClick={() => setRefreshKey(v => v + 1)}><RefreshCw size={15}/> Повторить</button></div>}
        {!loading && !error && visible.length === 0 && <div className="state-panel"><div className="state-symbol"><Search size={20}/></div><strong>{view === 'Saved' ? 'Пока ничего не сохранено' : 'Источники не найдены'}</strong><p>{view === 'Saved' ? 'Сохрани интересный источник кнопкой с закладкой.' : query ? 'Измени поисковую фразу или очисти поле поиска.' : 'Начни поиск, чтобы собрать первые источники.'}</p>{!query && view !== 'Saved' && <button className="primary-button" onClick={() => setActivePage('search')}><Search size={15}/> Перейти к поиску</button>}</div>}
        <div className="story-list">{!loading && !error && visible.map(story => <article className="story" key={story.id}>
          <div className="story-main"><div className="story-meta"><span className="topic">{story.topic}</span><span className="source-name">{story.source}</span></div><h2>{story.title}</h2><p className="summary">{story.summary}</p><a className="source-link" href={story.url} target="_blank" rel="noreferrer">Открыть источник <ExternalLink size={13}/></a></div>
          <div className="story-actions"><span className={`status status-${String(story.status).toLowerCase().replace(/\s+/g, '-')}`}>{story.status === 'New' ? 'Новый' : story.status === 'Saved' ? 'Сохранён' : story.status === 'Researching' ? 'В работе' : story.status}</span><button className={`action-button ${story.status === 'Saved' ? 'action-active' : ''}`} title="Сохранить источник" aria-label="Сохранить источник" onClick={() => updateStory(story.id, story.status === 'Saved' ? 'found' : 'Saved')}><Bookmark size={16}/></button><button className={`action-button ${story.status === 'Researching' ? 'action-active' : ''}`} title="Взять в работу" aria-label="Взять в работу" onClick={() => updateStory(story.id, 'Researching')}><Play size={16}/></button><button className="action-button" title="Вернуть в новые" aria-label="Вернуть в новые" onClick={() => updateStory(story.id, 'found')}><Check size={16}/></button><button className="action-button danger-action" title="Отклонить источник" aria-label="Отклонить источник" onClick={() => updateStory(story.id, 'Rejected')}><X size={16}/></button></div>
        </article>)}</div>
        {!loading && !error && <div className="pagination"><button className="secondary-button" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Назад</button><span>Страница {page + 1} из {Math.max(1, Math.ceil(totalSources / pageSize))} <small>· всего {totalSources}</small></span><button className="secondary-button" disabled={(page + 1) * pageSize >= totalSources} onClick={() => setPage(p => p + 1)}>Далее</button></div>}
      </section>
    </> : activePage === 'search' ? <SearchPage apiBase={API_BASE} onSourcesUpdated={() => { setActivePage('sources'); setPage(0); setRefreshKey(v => v + 1) }}/> : <LLMSettings apiBase={API_BASE}/>}
    <footer className="app-footer"><span>RESEARCH SCOUT <span className="footer-muted">/</span> LOCAL WORKSPACE</span><span>{error ? 'Backend недоступен' : 'Локальное исследовательское пространство'}</span></footer>
  </div>
}
