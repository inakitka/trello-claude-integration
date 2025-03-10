const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Загрузка переменных окружения
dotenv.config();

// Определяем, работаем ли мы в режиме MCP сервера
const isMcpMode = process.env.MCP_MODE === 'true';

// Настраиваем логирование - в режиме MCP выводим логи в STDERR
const logger = {
  log: (...args) => {
    if (isMcpMode) {
      // В режиме MCP выводим логи в STDERR
      process.stderr.write(util.format(...args) + '\n');
    } else {
      // В обычном режиме используем console.log
      console.log(...args);
    }
  },
  error: (...args) => {
    // Ошибки всегда выводим в STDERR
    process.stderr.write(util.format(...args) + '\n');
  }
};

// Инициализация приложения Express
const app = express();
app.use(express.json());

// Настройка CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Загрузка конфигурации
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'smithery/config/default.json'), 'utf8'));

// Загрузка хука для Trello
const trelloHook = require('./smithery/hooks/trello-hook');

// Загрузка действий
const loadActions = (actionPath) => {
  const actionFile = path.join(__dirname, actionPath);
  return JSON.parse(fs.readFileSync(actionFile, 'utf8'));
};

const actions = {};
Object.entries(config.actions).forEach(([key, value]) => {
  actions[key] = loadActions(value);
});

// Эндпоинт для обработки запросов к Trello API
app.post('/api/trello/action', async (req, res) => {
  try {
    const result = await trelloHook(req, { actions: actions });
    res.json(result);
  } catch (error) {
    logger.error('Error processing request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
      details: error.details || null
    });
  }
});

// Эндпоинт для проверки работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.log(`MCP Server running on port ${PORT}`);
  logger.log(`Loaded actions: ${Object.keys(actions).join(', ')}`);
}); 