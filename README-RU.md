# Classic Tetris

Классическая игра Tetris, реализованная с использованием HTML, CSS и JavaScript.

![Tetris Game](./Tetris_logo.png)

Наша версия (https://nickscherbakov.github.io/very-simple-tetris-created-by-Copilot/)

## Описание 

Эта реализация классической игры Tetris включает все основные элементы оригинала и добавляет современные улучшения:
- Семь стандартных тетромино (I, J, L, O, S, T, Z)
- Повышение сложности на каждом новом уровне
- Система подсчета очков с бонусами за мягкое/жесткое падение
- Отображение следующей фигуры
- Возможность включения/отключения сетки
- Адаптивный обучающий движок, анализирующий ошибки игрока
- Дополнительные сенсорные кнопки для мобильных устройств
- Сохранение рекорда и настройки сетки между сессиями

## Особенности

- Плавная анимация и отзывчивое управление
- Возможность приостановки игры
- Отображение количества очков, уровня и линий
- Предварительный просмотр следующей фигуры
- Настраиваемая визуальная сетка
- Эффекты блеска для тетромино
- Панель «AI Insight», объясняющая смену стратегии ИИ
- Экранные кнопки управления для устройств с сенсорным вводом
- Сохранение рекорда и предпочтений сетки в localStorage

## Управление

- **← →** : Движение влево/вправо
- **↑** : Вращение фигуры
- **↓** : Мягкое падение (ускоренное)
- **Пробел** : Жесткое падение (мгновенное)
- **P** : Пауза
- **G** : Включение/отключение отображения сетки
- **Сенсорная панель** : Кнопки для движения, вращения, падения и паузы на мобильных устройствах

На мобильных устройствах лучше добавить игру на главный экран или открыть ее в полноэкранном режиме для удобного доступа к сенсорным кнопкам.

## Система подсчета очков

- 1 линия: 40 × уровень
- 2 линии: 100 × уровень
- 3 линии: 300 × уровень
- 4 линии: 1200 × уровень
- Мягкое падение: +1 очко за каждую ячейку
- Жесткое падение: +2 очка за каждую ячейку

## Адаптивный обучающий ИИ

Встроенный тренер отслеживает каждое ваше действие: если определенные фигуры приводят к появлению «дыр» или высоким башням, такие тетромино будут выпадать чаще, а полезные фигуры — реже. Скорость падения при этом никогда не меняется, чтобы сохранить честный геймплей. Во время партии панель **AI Insight** подсказывает, на что сейчас делает упор ИИ, а после проигрыша подробно объясняет, как именно ему удалось использовать ваши ошибки — так вы сможете скорректировать стратегию в следующий раз.

## Установка и запуск

1. Клонируйте репозиторий или скачайте файлы проекта
2. Откройте `index.html` в любом современном веб-браузере
3. Нажмите кнопку "Start Game" для начала игры

## Технологии

- HTML5
- CSS3
- JavaScript (использует Canvas API для отрисовки)

## AI Prompt for Recreation

### Prompt for AI Assistant

Create a classic Tetris game implementation using HTML, CSS, and JavaScript with the following specifications:

1. **Game Structure**:
   - Create an HTML file with a main game canvas (300x600px) for the Tetris board
   - Add a secondary canvas (100x100px) to display the next piece
   - Set up a score display area showing score, level, and lines cleared
   - Include Start/Restart button and Grid Toggle button
   - Add a controls guide section

2. **Game Mechanics**:
   - Implement a 10x20 grid for the game board
   - Create the 7 standard tetromino shapes (I, J, L, O, S, T, Z) with distinct colors
   - Set up piece movement (left, right, down), rotation, and collision detection
   - Implement soft drop (faster descent) and hard drop (instant placement)
   - Add line clearing with appropriate scoring
   - Implement level progression (every 10 lines) with increasing speed
   - Include game over detection when pieces stack to the top
   - Add pause functionality

3. **Visual Elements**:
   - Style the game with a dark theme (black background for game area)
   - Add a shine effect to each tetromino block
   - Implement optional grid display that can be toggled on/off
   - Create a start screen, pause screen, and game over screen with appropriate messages
   - Ensure the next piece preview shows the upcoming tetromino centered in its canvas

4. **Controls**:
   - Arrow keys for movement (left, right, down) and rotation (up)
   - Space bar for hard drop
   - P key for pause/resume
   - G key for toggling grid visibility

5. **Scoring System**:
   - 40 × level points for 1 line
   - 100 × level points for 2 lines
   - 300 × level points for 3 lines
   - 1200 × level points for 4 lines
   - 1 bonus point for each cell in soft drop
   - 2 bonus points for each cell in hard drop

Implement the game using vanilla JavaScript with the Canvas API for rendering, ensuring smooth gameplay with appropriate animation timing. The implementation should be responsive and work in modern browsers without external libraries.

## Автор

[Ваше имя] - [ссылка на профиль или контакты]

## Лицензия

Этот проект лицензирован под [укажите лицензию, например, MIT License] - см. файл LICENSE для подробностей.
