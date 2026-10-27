from app.llm.client import LLMClient


class ArticleAnalyzer:
    def __init__(self):
        self.llm = LLMClient()

    def analyze(self, title: str, content: str) -> str:
        prompt = f"""
You are a research scout for an English-language YouTube channel.

Evaluate this source as a potential story.

Use ONLY the supplied information. Do not invent facts.
Treat claims as unverified unless the text provides evidence.

Return exactly these fields:

STORY: A short description in 1-2 sentences.
HOOK: What makes this story unusual or interesting?
POTENTIAL: High, Medium, or Low.
VERIFY: One key claim that needs independent verification.

TITLE:
{title}

SOURCE TEXT:
{content[:5000]}
"""
        return self.llm.ask(prompt)
