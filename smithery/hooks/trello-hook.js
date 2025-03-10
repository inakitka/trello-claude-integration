/**
 * Основной хук для обработки запросов к Trello API через Smithery.ai
 * 
 * @param {Object} request - Входящий запрос
 * @param {Object} context - Контекст выполнения
 * @returns {Object} - Результат выполнения
 */
const util = require('util');

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

module.exports = async function(request, context) {
  const { action, parameters } = request.body;
  
  // Проверка наличия необходимых параметров
  if (!action || !parameters) {
    return {
      status: "error",
      message: "Отсутствуют обязательные поля: action и parameters"
    };
  }
  
  try {
    // Логирование запроса
    logger.log(`Выполнение действия: ${action} с параметрами:`, parameters);
    
    // Проверка существования действия
    if (!context.actions[action]) {
      return {
        status: "error",
        message: `Неизвестное действие: ${action}`
      };
    }
    
    // Выполнение действия
    const result = await context.actions[action](parameters);
    
    // Логирование успешного результата
    logger.log(`Действие ${action} успешно выполнено:`, result);
    
    return {
      status: "success",
      data: result
    };
  } catch (error) {
    // Логирование ошибки
    logger.error(`Ошибка при выполнении действия ${action}:`, error);
    
    return {
      status: "error",
      message: error.message,
      details: error.details || null
    };
  }
}; 