from openai import OpenAI
from app.config import LM_STUDIO_URL, MODEL_NAME

class LLMClient:
    def __init__(self):
        self.client = OpenAI(
            base_url=LM_STUDIO_URL,
            api_key="lm-studio",
        )

    def ask(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt}
            ],
        )

        return response.choices[0].message.content