# API Документация

В этом документе описаны возможности API для интеграции Claude с Trello через MCP Server на базе Smithery.ai.

## Основные эндпоинты

### Выполнение действия

```
POST /api/trello/action
```

#### Параметры запроса

| Параметр | Тип | Описание |
|----------|-----|----------|
| action | string | Название действия для выполнения |
| parameters | object | Параметры для выполнения действия |

#### Пример запроса

```json
{
  "action": "createCard",
  "parameters": {
    "listId": "60d5a7e89c9f8f2a61b1b29c",
    "name": "Разработать дизайн главной страницы",
    "desc": "Необходимо создать макет главной страницы в Figma",
    "due": "2023-10-15T12:00:00.000Z",
    "idLabels": ["60d5a7e89c9f8f2a61b1b29d"],
    "idMembers": ["60d5a7e89c9f8f2a61b1b29e"]
  }
}
```

#### Пример ответа

```json
{
  "status": "success",
  "data": {
    "id": "60d5a7e89c9f8f2a61b1b29f",
    "name": "Разработать дизайн главной страницы",
    "url": "https://trello.com/c/abc123/разработать-дизайн-главной-страницы"
  }
}
```

## Доступные действия

### Действия с досками (boards)

| Действие | Описание | Обязательные параметры | Опциональные параметры |
|----------|----------|------------------------|------------------------|
| getBoards | Получение списка досок пользователя | - | - |
| getBoardById | Получение информации о доске по ID | boardId | - |
| createBoard | Создание новой доски | name | desc, defaultLists, prefs_permissionLevel |
| updateBoard | Обновление информации о доске | boardId | name, desc, closed, subscribed |
| getBoardMembers | Получение списка участников доски | boardId | - |
| inviteMember | Приглашение нового участника на доску | boardId, email | type |
| getBoardLists | Получение списков на доске | boardId | filter |
| getBoardLabels | Получение меток доски | boardId | - |
| createBoardLabel | Создание новой метки на доске | boardId, name, color | - |
| getBoardCards | Получение всех карточек на доске | boardId | - |
| closeBoard | Архивирование доски | boardId | - |

### Действия с карточками (cards)

| Действие | Описание | Обязательные параметры | Опциональные параметры |
|----------|----------|------------------------|------------------------|
| createCard | Создание новой карточки в указанном списке | listId, name | desc, due, idLabels, idMembers, pos |
| getCard | Получение данных карточки по её ID | cardId | - |
| updateCard | Обновление данных карточки | cardId | name, desc, due, idList, idLabels, idMembers, pos, closed |
| deleteCard | Удаление карточки | cardId | - |
| moveCardToList | Перемещение карточки в другой список | cardId, listId | pos |
| addLabelToCard | Добавление метки к карточке | cardId, labelId | - |
| removeLabelFromCard | Удаление метки с карточки | cardId, labelId | - |
| addMemberToCard | Добавление участника к карточке | cardId, memberId | - |
| removeMemberFromCard | Удаление участника с карточки | cardId, memberId | - |
| setCardDueDate | Установка срока для карточки | cardId, due | - |
| searchCards | Поиск карточек по запросу | query | boardId, idList, modelTypes |

### Действия со списками (lists)

| Действие | Описание | Обязательные параметры | Опциональные параметры |
|----------|----------|------------------------|------------------------|
| getList | Получение информации о списке по ID | listId | - |
| createList | Создание нового списка на доске | name, boardId | pos |
| updateList | Обновление информации о списке | listId | name, closed, pos, subscribed |
| moveList | Перемещение списка на другую доску | listId, boardId | pos |
| archiveList | Архивирование списка | listId | - |
| getCardsInList | Получение всех карточек в списке | listId | - |
| sortList | Сортировка карточек в списке | listId | - |

### Действия с участниками (members)

| Действие | Описание | Обязательные параметры | Опциональные параметры |
|----------|----------|------------------------|------------------------|
| getMember | Получение информации о пользователе по ID | memberId | - |
| getCurrentMember | Получение информации о текущем пользователе | - | - |
| getMemberBoards | Получение досок, с которыми связан пользователь | memberId | filter |
| getMemberCards | Получение карточек, назначенных пользователю | memberId | - |
| getMemberOrganizations | Получение организаций, с которыми связан пользователь | memberId | - |
| findMemberByUsername | Поиск пользователя по имени пользователя | username | - |
| removeMemberFromBoard | Удаление участника с доски | boardId, memberId | - |
| updateMemberBoardRole | Изменение роли участника на доске | boardId, memberId, type | - |

### Действия с метками (labels)

| Действие | Описание | Обязательные параметры | Опциональные параметры |
|----------|----------|------------------------|------------------------|
| getLabel | Получение информации о метке по ID | labelId | - |
| createLabel | Создание новой метки на доске | boardId, name, color | - |
| updateLabel | Обновление информации о метке | labelId | name, color |
| deleteLabel | Удаление метки | labelId | - |
| addLabelToCard | Добавление метки к карточке | cardId, labelId | - |
| removeLabelFromCard | Удаление метки с карточки | cardId, labelId | - |
| findLabelsByName | Поиск меток по названию на доске | boardId, name | - |

## Обработка ошибок

В случае ошибки возвращается JSON-объект со следующими полями:

```json
{
  "status": "error",
  "message": "Текст ошибки",
  "details": "Дополнительная информация об ошибке (опционально)"
}
```

## Лимиты запросов

API использует ограничение скорости запросов в 100 запросов в минуту. При превышении лимита сервер вернет ошибку 429 Too Many Requests. 