# Research Scout
Research Scout is a local research tool that searches the web for interesting stories and documented events, stores discovered sources, and uses a local LLM to analyze new articles.

## Features
  **Topic-based search** — search across predefined categories.
  **Web search** — retrieve results through SearXNG.
  **Source storage** — save discovered sources in an SQLite database.
  **Duplicate detection** — skip sources that have already been saved.
  **LLM-powered analysis** — analyze new sources using a locally hosted language model.
  **Web interface** — interact with the application through a React frontend.

## Requirements
  Docker Desktop with Docker Compose
  A configured SearXNG service
  A locally available LLM through the configured model runner

## Getting Started
### Clone the repository
  ```bash
  git clone <repository-url>
  cd research-scout
  ```

### Start the application
  From the project root, run:
  ```bash
  docker compose up --build
  ```
  Wait until the containers have started.

### Services
  Frontend — http://localhost:5173/; React web interface 
  Backend API — http://localhost:8000/; FastAPI endpoints 
  SearXNG — http://localhost:8080/; Web search 
  Model Runner — http://localhost:8081/; Local LLM inference 

## Architecture
  **Frontend:** — React and Vite
  **Backend:** — Python and FastAPI
  **Search engine:** — SearXNG
  **Database:** — SQLite
  **Language model:** — locally hosted LLM through Model Runner


### Stop the application
  Press `Ctrl+C` in the terminal, then run:
  ```bash
  docker compose down
  ```

## Configuration
  The application uses `config.py` for settings such as the LLM endpoint, model name, and SearXNG URL.
  The currently configured model is Mistral 7B Q4_0.

## Project Status
  The core search, source storage, and article analysis workflow is implemented. Improvements to the interface and LLM selection are planned.

## Security
  Do not commit API keys, passwords, private environment files, or other secrets. Keep local configuration and sensitive files out of version control.
