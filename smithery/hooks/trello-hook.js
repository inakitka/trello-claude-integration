/**
 * Основной хук для обработки запросов к Trello API через Smithery.ai
 * 
 * @param {Object} request - Входящий запрос
 * @param {Object} context - Контекст выполнения
 * @returns {Object} - Результат выполнения
 */
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
    console.log(`Выполнение действия: ${action} с параметрами:`, parameters);
    
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
    console.log(`Действие ${action} успешно выполнено:`, result);
    
    return {
      status: "success",
      data: result
    };
  } catch (error) {
    // Логирование ошибки
    console.error(`Ошибка при выполнении действия ${action}:`, error);
    
    return {
      status: "error",
      message: error.message,
      details: error.details || null
    };
  }
}; 