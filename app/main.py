
from app.search.search import SearchClient
from app.storage.database import init_db, source_exists, save_source

search = SearchClient()

init_db()
# ============================================================================================
# ============================================================================================
# ============================================================================================



queries = []

# 1. IT и цифровой хаос
queries_it = [    "software bugs that caused major real world disasters",    "database errors that caused massive financial losses",    "AI agent failures with unexpected real world consequences",    "deployment mistakes that caused major service outages",    "internet infrastructure failures and their root causes",    "cybersecurity incidents caused by human error",    "software glitches that disrupted critical infrastructure",    "technology failures that cost companies billions",    "programming errors with bizarre unexpected consequences",    "cloud service outages caused by configuration mistakes",    "famous IT disasters and the mistakes behind them",    "technical failures that brought down major online services",]

# 2. Политика и государственный абсурд
queries_politics = [    "strange government decisions with documented consequences",    "absurd laws that are still enforced today",    "bureaucratic mistakes that caused major public scandals",    "government projects that failed in bizarre ways",    "political scandals caused by ridiculous misunderstandings",    "official government blunders caught on camera",    "unintended consequences of government policies",    "countries that banned something for an unexpected reason",    "expensive public projects that became embarrassing failures",    "diplomatic incidents caused by absurd mistakes",    "government paperwork mistakes with serious consequences",    "documented cases of political incompetence",]

# 3. Маленький человек против системы
queries_underdog = [    "ordinary people who defeated powerful corporations in court",    "individuals who exposed major corporate wrongdoing",    "small businesses that won impossible legal battles",    "whistleblowers who changed entire industries",    "ordinary people who challenged unjust laws and won",    "citizens who forced governments to reverse decisions",    "famous legal battles between individuals and corporations",    "people who uncovered massive institutional fraud",    "workers who stood up to powerful employers and won",    "unexpected legal victories against major companies",    "individuals who exposed corruption against all odds",    "real stories of people fighting the system and winning",]

# 4. Тупые активисты
queries_activists = [    "activist stunts that backfired spectacularly",    "protest actions that caused public outrage for unexpected reasons",    "environmental protests with bizarre unintended consequences",    "famous activist stunts that damaged their own cause",    "protesters who accidentally helped the people they opposed",    "absurd political demonstrations caught on camera",    "controversial art protests and their consequences",    "activist campaigns criticized for hypocrisy",    "protest actions that went completely wrong",    "strange public stunts that became international scandals",    "documented cases of protest tactics backfiring",    "activist publicity stunts with unexpected results",]

# 5. Домашние животные
queries_pets = [    "pets that caused unbelievable damage to their owners homes",    "cats that accidentally became local legends",    "dogs that triggered bizarre police incidents",    "pets that interrupted important events in hilarious ways",    "animals that escaped homes in extraordinary ways",    "pets that accidentally exposed crimes or secrets",    "funny documented cases of pets outsmarting their owners",    "cats behaving like tiny criminals real stories",    "dogs that became famous for unusual behavior",    "pets that accidentally caused expensive disasters",    "strange animal behavior reported by veterinarians",    "real stories of pets causing absolute chaos",]

# 6. Необычные животные и дикая природа
queries_wildlife = [    "animals with bizarre evolutionary adaptations",    "wild animals that accidentally disrupted human infrastructure",    "unexpected animal invasions that caused major problems",    "strange survival strategies in the animal kingdom",    "animals that evolved traits that seem completely absurd",    "wildlife encounters with unbelievable documented outcomes",    "invasive species that transformed entire ecosystems",    "animals that use tools in surprising ways",    "bizarre animal mating and survival behaviors",    "wild animals that became unexpected urban legends",    "dangerous animals with surprisingly unusual weaknesses",    "real cases of animals disrupting military or industrial operations",]

# 7. Исторические гигачады прошлого
queries_history = [    "historical leaders who achieved extraordinary feats against the odds",    "forgotten military commanders with unbelievable victories",    "ancient rulers who made audacious political decisions",    "medieval battles won through unconventional strategies",    "historical figures who defied powerful empires",    "remarkable acts of courage in ancient and medieval history",    "historical sieges with unexpected outcomes",    "forgotten historical figures with extraordinary achievements",    "leaders who survived impossible political situations",    "historical events that sound fictional but are documented",    "ancient engineering achievements that seem impossible",    "medieval rulers who changed history through bold decisions",]

# 8. Политический цинизм современности и экспорт «демократии»
queries_geopolitics = [    "documented cases of foreign intervention with unintended consequences",    "military operations that produced unexpected political outcomes",    "when great powers abandoned their allies historical examples",    "international interventions that destabilized countries",    "documented hypocrisy in international relations",    "military campaigns that failed to achieve their stated goals",    "how strategic interests shaped controversial foreign policy decisions",    "historical cases of broken diplomatic promises",    "international law controversies involving powerful states",    "weapons developed for one purpose used in unexpected ways",    "military technology that changed the political balance",    "documented contradictions between foreign policy rhetoric and actions",]

# 9. Игровая индустрия и нишевые легенды
queries_gaming = [    "MMORPG economy collapses caused by players",    "infamous video game scandals from the 2000s",    "legendary MMORPG scams and betrayals",    "video game exploits that changed entire communities",    "retro RPG controversies and bizarre development stories",    "game developer decisions that caused player revolts",    "broken in game economies with real player consequences",    "famous MMORPG heists and virtual bank scandals",    "unexpected stories from classic role playing games",    "cult moments in gaming history that sound unbelievable",    "video game bugs that created legendary gameplay moments",    "gaming community mysteries with documented explanations",]


def get_queries(choice: str) -> list[str]:
    if choice == "1":
        return queries_it
    elif choice == "2":
        return queries_politics
    elif choice == "3":
        return queries_underdog
    elif choice == "4":
        return queries_activists
    elif choice == "5":
        return queries_pets
    elif choice == "6":
        return queries_wildlife
    elif choice == "7":
        return queries_history
    elif choice == "8":
        return queries_geopolitics
    elif choice == "9":
        return queries_gaming
    else:
        raise ValueError("Invalid category choice")


def execute_search(choice: str, limit: int = 2):
    queries = get_queries(choice)
    # Здесь будет существующий цикл поиска,
    # сохранение источников в БД и запуск анализа.

    total_found = 0
    new_sources = 0
    duplicates = 0
    sources_to_analyze = []

    for query in queries:
        print(f"\n{'=' * 60}")
        print(f"FIND: {query}")
        print("=" * 60)

        try:
            results = search.search(query, limit=limit)
        except Exception as exc:
            print(f"Search error: {exc}")
            continue

        total_found += len(results)

        for result in results:
            url = result.get("url", "").strip()

            if not url:
                continue

            if source_exists(url):
                duplicates += 1
                continue

            save_source(
                url=url,
                title=result.get("title", ""),
                snippet=result.get("snippet", ""),
            )

            new_sources += 1

            sources_to_analyze.append({
                "url": url,
                "title": result.get("title", ""),
                "snippet": result.get("snippet", ""),
            })

            print(f"\n[NEW] {result.get('title', 'Untitled')}")
            print(f"URL: {url}")
            print(f"Snippet: {result.get('snippet', '')[:250]}")

    print("\n" + "=" * 60)
    print("FIND SUMMARY")
    print("=" * 60)
    print(f"Search results received: {total_found}")
    print(f"New sources saved: {new_sources}")
    print(f"Duplicates skipped: {duplicates}")
    if sources_to_analyze:
        print("\nStarting article analysis with Mistral...")

        from app.research.researcher import main as run_research

        run_research(sources=sources_to_analyze[:10])
    else:
        print("\nNo new sources to analyze.")

    return {
        "query": choice,
        "found": total_found,
        "saved": new_sources,
        "duplicates": duplicates,
    }