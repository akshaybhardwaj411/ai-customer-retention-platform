from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Customer Retention Platform API"
    database_url: str = ""
    secret_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
