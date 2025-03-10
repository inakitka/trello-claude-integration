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

// Преобразование действий Trello в инструменты MCP
const mcpTools = [];

// Для каждой категории действий (boards, cards, lists, etc.)
Object.entries(actions).forEach(([category, categoryActions]) => {
  // Для каждого действия в категории
  Object.entries(categoryActions).forEach(([actionName, actionConfig]) => {
    const toolName = `trello_${category}_${actionName}`;
    const parameters = {};
    
    // Преобразование параметров действия в параметры инструмента
    Object.entries(actionConfig.parameters || {}).forEach(([paramName, paramConfig]) => {
      parameters[paramName] = {
        type: paramConfig.type === 'array' ? 'array' : 'string',
        required: paramConfig.required || false,
        description: `Parameter ${paramName} for ${actionName}`
      };
    });
    
    // Добавление инструмента в список
    mcpTools.push({
      name: toolName,
      description: actionConfig.description || `Trello ${category} ${actionName} action`,
      parameters
    });
  });
});

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

// Обработка JSON-RPC запросов
app.post('/', async (req, res) => {
  const jsonRpcRequest = req.body;
  logger.log('Received JSON-RPC request:', JSON.stringify(jsonRpcRequest));
  
  // Проверка валидности JSON-RPC запроса
  if (!jsonRpcRequest.jsonrpc || jsonRpcRequest.jsonrpc !== '2.0' || !jsonRpcRequest.method) {
    return res.json({
      jsonrpc: '2.0',
      id: jsonRpcRequest.id || null,
      error: {
        code: -32600,
        message: 'Invalid Request'
      }
    });
  }
  
  // Обработка метода initialize
  if (jsonRpcRequest.method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: jsonRpcRequest.id,
      result: {
        name: 'Trello Claude Integration',
        version: '1.0.0',
        vendor: 'Custom MCP Server'
      }
    });
  }
  
  // Обработка метода tools/list
  if (jsonRpcRequest.method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id: jsonRpcRequest.id,
      result: {
        tools: mcpTools
      }
    });
  }
  
  // Обработка вызова инструмента
  if (jsonRpcRequest.method === 'tools/call') {
    const params = jsonRpcRequest.params || {};
    const toolName = params.name;
    const toolParams = params.parameters || {};
    
    if (!toolName) {
      return res.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32602,
          message: 'Invalid params: missing tool name'
        }
      });
    }
    
    // Разбор имени инструмента (trello_category_action)
    const parts = toolName.split('_');
    if (parts.length < 3 || parts[0] !== 'trello') {
      return res.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32601,
          message: `Method not found: ${toolName}`
        }
      });
    }
    
    const category = parts[1];
    const actionName = parts.slice(2).join('_');
    
    // Проверка существования категории и действия
    if (!actions[category] || !actions[category][actionName]) {
      return res.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32601,
          message: `Method not found: ${toolName}`
        }
      });
    }
    
    try {
      // Выполнение действия через хук Trello
      const result = await trelloHook(
        { body: { action: actionName, parameters: toolParams } },
        { actions: { [actionName]: actions[category][actionName] } }
      );
      
      return res.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        result: {
          content: result
        }
      });
    } catch (error) {
      logger.error(`Error executing tool ${toolName}:`, error);
      
      return res.json({
        jsonrpc: '2.0',
        id: jsonRpcRequest.id,
        error: {
          code: -32000,
          message: error.message || 'Server error'
        }
      });
    }
  }
  
  // Метод не найден
  return res.json({
    jsonrpc: '2.0',
    id: jsonRpcRequest.id,
    error: {
      code: -32601,
      message: `Method not found: ${jsonRpcRequest.method}`
    }
  });
});

// Эндпоинт для проверки работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Для обратной совместимости сохраняем старый эндпоинт
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

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.log(`MCP Server running on port ${PORT}`);
  logger.log(`Loaded ${mcpTools.length} MCP tools`);
}); 