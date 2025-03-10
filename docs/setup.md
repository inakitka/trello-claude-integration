# Инструкция по настройке

Этот документ описывает процесс настройки интеграции Claude с Trello через MCP Server на базе Smithery.ai.

## Предварительные требования

1. Node.js 18 или выше
2. Аккаунт в Trello с правами администратора
3. API ключ и токен Trello
4. API ключ Claude
5. Аккаунт в Smithery.ai

## Шаг 1: Настройка Trello API

1. Перейдите на страницу [https://trello.com/app-key](https://trello.com/app-key)
2. Скопируйте API ключ (API Key)
3. Нажмите на ссылку "Token" для генерации токена доступа
4. Выберите разрешения для токена (рекомендуется разрешить все)
5. Скопируйте токен

## Шаг 2: Настройка Claude API

1. Зарегистрируйтесь или войдите в [https://console.anthropic.com](https://console.anthropic.com)
2. Перейдите в раздел API Keys
3. Создайте новый API ключ и скопируйте его

## Шаг 3: Настройка Smithery.ai

1. Зарегистрируйтесь или войдите в [https://smithery.ai](https://smithery.ai)
2. Создайте новый проект
3. Запишите ID проекта и сгенерируйте API ключ
4. В настройках проекта укажите разрешенные origin для CORS

## Шаг 4: Клонирование репозитория

```bash
git clone https://github.com/yourusername/trello-claude-integration.git
cd trello-claude-integration
```

## Шаг 5: Настройка переменных окружения

1. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

2. Отредактируйте файл `.env` и укажите все необходимые ключи:

```
# Trello API Credentials
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token

# Claude API Credentials
CLAUDE_API_KEY=your_claude_api_key

# Smithery.ai Credentials
SMITHERY_API_KEY=your_smithery_api_key
SMITHERY_PROJECT_ID=your_smithery_project_id

# Environment (development, test, production)
NODE_ENV=development
```

## Шаг 6: Установка зависимостей

```bash
npm install
```

## Шаг 7: Запуск тестов

```bash
npm test
```

## Шаг 8: Деплой

### Вариант 1: Локальный деплой

```bash
npm run deploy
```

### Вариант 2: Настройка GitHub Actions для автоматического деплоя

1. Создайте репозиторий на GitHub
2. Добавьте секреты в настройках репозитория:
   - `SMITHERY_API_KEY`
   - `SMITHERY_PROJECT_ID`
   - `TRELLO_API_KEY`
   - `TRELLO_TOKEN`
   - `CLAUDE_API_KEY`
3. Отправьте код в репозиторий:

```bash
git remote add origin https://github.com/yourusername/trello-claude-integration.git
git push -u origin main
```

GitHub Actions автоматически выполнит деплой при push в ветку main.

## Шаг 9: Настройка Claude

1. Настройте промпт для Claude, который будет использовать интеграцию
2. Укажите URL вашего MCP Server в промпте
3. Протестируйте интеграцию, отправив запрос к Claude

## Устранение неполадок

### Ошибка аутентификации в Trello

Проверьте правильность API ключа и токена Trello. Убедитесь, что токен имеет необходимые разрешения.

### Ошибка аутентификации в Claude

Проверьте правильность API ключа Claude и убедитесь, что у вас есть доступ к необходимым моделям.

### Ошибка CORS

Убедитесь, что в настройках проекта Smithery.ai указаны правильные origin для CORS. 