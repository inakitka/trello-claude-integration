FROM node:18-alpine

WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Открытие порта
EXPOSE 3000

# Установка переменной окружения для режима MCP
ENV MCP_MODE=true
ENV NODE_ENV=production

# Запуск приложения
CMD ["node", "server.js"] 