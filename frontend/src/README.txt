Research Scout frontend package

Copy App.jsx, App.css, Search.jsx, Search.css, LLMSettings.jsx, LLMSettings.css and index.css into frontend/src. Keep your existing main.jsx.

Dependencies used: react, lucide-react, Vite.

Existing endpoints used: GET /api/sources, PATCH /api/sources/status, POST /api/search.
LLM test button calls POST /api/llm/test, which still needs to be implemented in the backend. LLM settings are saved in this browser localStorage until backend persistence is added.

Optional .env setting: VITE_API_BASE_URL=http://127.0.0.1:8000
