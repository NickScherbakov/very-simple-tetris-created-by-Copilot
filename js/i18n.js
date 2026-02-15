// Internationalization (i18n) System
const translations = {
    en: {
        // Language Selection Screen
        select_language: "Select Language / Выберите язык",
        
        // Rules Screen
        rules_title: "How to Play",
        rules_how_to_play: "How to Play",
        rules_controls: "Controls:",
        rules_arrow_left_right: "← → Arrow keys - Move pieces left/right",
        rules_arrow_up: "↑ Arrow up - Rotate piece",
        rules_arrow_down: "↓ Arrow down - Soft drop (speed up)",
        rules_space: "Space - Hard drop (instant drop)",
        rules_mobile: "Mobile: Swipes and taps for controls",
        
        rules_tetricoins: "TetriCoins System:",
        rules_initial_balance: "Starting balance: 1000 TC",
        rules_daily_bonus: "Daily bonus: +100 TC",
        rules_line_rewards: "Line rewards:",
        rules_1_line: "1 line = 10 TC",
        rules_2_lines: "2 lines = 30 TC",
        rules_3_lines: "3 lines = 100 TC",
        rules_4_lines: "4 lines (Tetris) = 500 TC",
        
        rules_ai_mode: "AI vs AI Mode:",
        rules_ai_betting: "Place bets on the winner",
        rules_ai_bet_types: "4 bet types with different odds",
        rules_ai_tournament: "Tournament mode with jackpot",
        
        rules_disclaimer: "Disclaimer:",
        rules_disclaimer_text: "This is a game with virtual currency. No real money is used. For entertainment only!",
        
        start_playing: "Start Playing!",
        
        // Game Interface
        score: "Score:",
        level: "Level:",
        lines: "Lines:",
        high_score: "High Score:",
        balance: "💰 Balance:",
        next: "Next:",
        controls: "Controls:",
        controls_text: "Enter/S: Start Game | Arrow Keys: Move/Drop | Space: Hard Drop | P: Pause | G: Toggle Grid | H: Toggle Ghost Piece | T: Take Control (AI Mode)",
        
        // Buttons
        start_game: "Start Game",
        ai_vs_ai_mode: "AI vs AI Mode",
        tournament_mode: "Tournament Mode",
        hide_grid: "Hide Grid",
        show_grid: "Show Grid",
        sound_on: "Sound",
        sound_off: "Muted",
        install_app: "Install App",
        achievements: "🏆 Achievements",
        share: "📤 Share",
        language_btn: "🌐 Language",
        
        // AI Insight
        ai_insight: "AI Insight:",
        ai_observing: "The adaptive engine is observing your moves.",
        
        // AI vs AI Panel
        ai_player_1: "AI Player 1 (Red)",
        ai_player_2: "AI Player 2 (Blue)",
        ai_analyzing: "AI is analyzing...",
        ai_planning: "Planning next move...",
        take_control: "Take Control",
        exit_ai_mode: "Exit AI Mode",
        current_turn: "Current Turn:",
        ai_1_turn: "AI 1's Turn",
        ai_2_turn: "AI 2's Turn",
        
        // Betting Panel
        place_bet: "🎲 Place Your Bet!",
        time_remaining: "Time remaining:",
        seconds: "sec",
        tournament: "🏆 Tournament",
        match: "Match",
        of: "of",
        jackpot: "Jackpot:",
        
        // Bet Types
        bet_winner: "🏆 Winner",
        bet_winner_desc: "Bet on the match winner",
        bet_first_tetris: "⚡ First Tetris",
        bet_first_tetris_desc: "Who gets 4 lines first",
        bet_score_range: "🎯 Score Range",
        bet_score_range_desc: "Guess the final score range",
        bet_score_race: "🏃 Score Race",
        bet_score_race_desc: "Who reaches 1000 points first",
        
        bet_amount: "💰 Bet Amount:",
        custom_amount: "Custom amount",
        place_bet_btn: "Place Bet",
        skip: "Skip",
        
        // Achievements
        achievements_title: "🏆 Achievements",
        achievements_progress: "Progress:",
        leaderboard: "📊 Leaderboard",
        
        achievement_lucky: "🍀 Lucky",
        achievement_lucky_desc: "5 winning bets in a row",
        achievement_analyst: "🔮 Analyst",
        achievement_analyst_desc: "Guessed 10 winners",
        achievement_rich: "💎 Rich",
        achievement_rich_desc: "Accumulated 10000 TC",
        achievement_sniper: "🎯 Sniper",
        achievement_sniper_desc: "Guessed exact score range 3 times",
        achievement_streak: "🔥 On Fire",
        achievement_streak_desc: "3 Tetris in a row in your game",
        
        // Team Tournament
        team_tournament_mode: "Team Tournament",
        team_tournament_title: "🏆 Team Tournament System",
        team_management: "Team Management",
        tournament_setup: "Tournament Setup",
        active_tournament: "Active Tournament",
        create_team: "Create Team",
        team_name: "Team Name",
        team_size: "Team Size",
        players: "Players",
        create_team_btn: "Create Team",
        delete_team: "Delete",
        select_teams: "Select Teams for Tournament",
        start_tournament: "Start Tournament",
        my_teams: "My Teams",
        team_stats: "Team Stats",
        matches_played: "Matches Played",
        matches_won: "Matches Won",
        avg_score: "Avg Score",
        match_round: "Round",
        team_vs_team: "vs",
        play_round: "Play Round",
        next_match: "Next Match",
        complete_tournament: "Complete Tournament",
        tournament_winner: "Tournament Winner",
        total_score: "Total Score",
        rounds_won: "Rounds Won",
        back_to_menu: "Back to Menu",
        
        // Footer
        footer_disclaimer: "🎮 This is a game with virtual currency. No real money is used. For entertainment only!",
    },
    
    ar: {
        // Language Selection Screen
        select_language: "اختر اللغة / Select Language",
        
        // Rules Screen
        rules_title: "كيف تلعب",
        rules_how_to_play: "كيف تلعب",
        rules_controls: "التحكم:",
        rules_arrow_left_right: "← → أسهم اليسار/اليمين - تحريك القطع",
        rules_arrow_up: "↑ سهم للأعلى - تدوير القطعة",
        rules_arrow_down: "↓ سهم للأسفل - سقوط سريع",
        rules_space: "مسافة - سقوط فوري",
        rules_mobile: "الموبايل: السحب والنقر للتحكم",
        
        rules_tetricoins: "نظام TetriCoins:",
        rules_initial_balance: "الرصيد الأولي: 1000 TC",
        rules_daily_bonus: "المكافأة اليومية: +100 TC",
        rules_line_rewards: "مكافآت الخطوط:",
        rules_1_line: "خط واحد = 10 TC",
        rules_2_lines: "خطان = 30 TC",
        rules_3_lines: "3 خطوط = 100 TC",
        rules_4_lines: "4 خطوط (Tetris) = 500 TC",
        
        rules_ai_mode: "وضع AI ضد AI:",
        rules_ai_betting: "ضع رهانات على الفائز",
        rules_ai_bet_types: "4 أنواع من الرهانات بمعاملات مختلفة",
        rules_ai_tournament: "وضع البطولة مع الجائزة الكبرى",
        
        rules_disclaimer: "تنويه:",
        rules_disclaimer_text: "هذه لعبة بعملة افتراضية. لا يتم استخدام أموال حقيقية. للترفيه فقط!",
        
        start_playing: "ابدأ اللعب!",
        
        // Game Interface
        score: "النقاط:",
        level: "المستوى:",
        lines: "الخطوط:",
        high_score: "أعلى نقاط:",
        balance: "💰 الرصيد:",
        next: "التالي:",
        controls: "التحكم:",
        controls_text: "Enter/S: بدء اللعبة | الأسهم: التحرك/السقوط | مسافة: سقوط فوري | P: إيقاف مؤقت | G: تبديل الشبكة | T: السيطرة (وضع AI)",
        
        // Buttons
        start_game: "بدء اللعبة",
        ai_vs_ai_mode: "وضع AI ضد AI",
        tournament_mode: "وضع البطولة",
        hide_grid: "إخفاء الشبكة",
        show_grid: "إظهار الشبكة",
        sound_on: "الصوت",
        sound_off: "صامت",
        install_app: "تثبيت التطبيق",
        achievements: "🏆 الإنجازات",
        share: "📤 مشاركة",
        language_btn: "🌐 اللغة",
        
        // AI Insight
        ai_insight: "رؤية AI:",
        ai_observing: "المحرك التكيفي يراقب حركاتك.",
        
        // AI vs AI Panel
        ai_player_1: "AI اللاعب 1 (أحمر)",
        ai_player_2: "AI اللاعب 2 (أزرق)",
        ai_analyzing: "AI يحلل...",
        ai_planning: "التخطيط للحركة التالية...",
        take_control: "السيطرة",
        exit_ai_mode: "الخروج من وضع AI",
        current_turn: "الدور الحالي:",
        ai_1_turn: "دور AI 1",
        ai_2_turn: "دور AI 2",
        
        // Betting Panel
        place_bet: "🎲 ضع رهانك!",
        time_remaining: "الوقت المتبقي:",
        seconds: "ثانية",
        tournament: "🏆 البطولة",
        match: "المباراة",
        of: "من",
        jackpot: "الجائزة الكبرى:",
        
        // Bet Types
        bet_winner: "🏆 الفائز",
        bet_winner_desc: "راهن على فائز المباراة",
        bet_first_tetris: "⚡ أول Tetris",
        bet_first_tetris_desc: "من يحصل على 4 خطوط أولاً",
        bet_score_range: "🎯 نطاق النقاط",
        bet_score_range_desc: "خمن نطاق النقاط النهائي",
        bet_score_race: "🏃 سباق النقاط",
        bet_score_race_desc: "من يصل إلى 1000 نقطة أولاً",
        
        bet_amount: "💰 مبلغ الرهان:",
        custom_amount: "مبلغ مخصص",
        place_bet_btn: "ضع الرهان",
        skip: "تخطي",
        
        // Achievements
        achievements_title: "🏆 الإنجازات",
        achievements_progress: "التقدم:",
        leaderboard: "📊 لوحة المتصدرين",
        
        achievement_lucky: "🍀 محظوظ",
        achievement_lucky_desc: "5 رهانات فائزة على التوالي",
        achievement_analyst: "🔮 محلل",
        achievement_analyst_desc: "خمنت 10 فائزين",
        achievement_rich: "💎 غني",
        achievement_rich_desc: "جمعت 10000 TC",
        achievement_sniper: "🎯 قناص",
        achievement_sniper_desc: "خمنت نطاق النقاط الدقيق 3 مرات",
        achievement_streak: "🔥 في حالة جيدة",
        achievement_streak_desc: "3 Tetris على التوالي في لعبتك",
        
        // Team Tournament
        team_tournament_mode: "بطولة الفرق",
        team_tournament_title: "🏆 نظام بطولات الفرق",
        team_management: "إدارة الفرق",
        tournament_setup: "إعداد البطولة",
        active_tournament: "البطولة النشطة",
        create_team: "إنشاء فريق",
        team_name: "اسم الفريق",
        team_size: "حجم الفريق",
        players: "اللاعبون",
        create_team_btn: "إنشاء فريق",
        delete_team: "حذف",
        select_teams: "اختر الفرق للبطولة",
        start_tournament: "بدء البطولة",
        my_teams: "فرقي",
        team_stats: "إحصائيات الفريق",
        matches_played: "المباريات الملعوبة",
        matches_won: "المباريات الفائزة",
        avg_score: "النقاط المتوسطة",
        match_round: "الجولة",
        team_vs_team: "ضد",
        play_round: "العب الجولة",
        next_match: "المباراة التالية",
        complete_tournament: "إكمال البطولة",
        tournament_winner: "فائز البطولة",
        total_score: "النقاط الإجمالية",
        rounds_won: "الجولات الفائزة",
        back_to_menu: "العودة للقائمة",
        
        // Footer
        footer_disclaimer: "🎮 هذه لعبة بعملة افتراضية. لا يتم استخدام أموال حقيقية. للترفيه فقط!",
    },
    
    zh: {
        // Language Selection Screen
        select_language: "选择语言 / Select Language",
        
        // Rules Screen
        rules_title: "如何游戏",
        rules_how_to_play: "如何游戏",
        rules_controls: "控制:",
        rules_arrow_left_right: "← → 左右箭头键 - 移动方块",
        rules_arrow_up: "↑ 上箭头 - 旋转方块",
        rules_arrow_down: "↓ 下箭头 - 快速下落",
        rules_space: "空格键 - 瞬间下落",
        rules_mobile: "移动设备: 滑动和点击控制",
        
        rules_tetricoins: "TetriCoins系统:",
        rules_initial_balance: "初始余额: 1000 TC",
        rules_daily_bonus: "每日奖励: +100 TC",
        rules_line_rewards: "行奖励:",
        rules_1_line: "1行 = 10 TC",
        rules_2_lines: "2行 = 30 TC",
        rules_3_lines: "3行 = 100 TC",
        rules_4_lines: "4行 (Tetris) = 500 TC",
        
        rules_ai_mode: "AI对战模式:",
        rules_ai_betting: "对获胜者下注",
        rules_ai_bet_types: "4种不同赔率的投注类型",
        rules_ai_tournament: "锦标赛模式含奖池",
        
        rules_disclaimer: "免责声明:",
        rules_disclaimer_text: "这是一款虚拟货币游戏。不使用真实货币。仅供娱乐!",
        
        start_playing: "开始游戏!",
        
        // Game Interface
        score: "分数:",
        level: "等级:",
        lines: "行数:",
        high_score: "最高分:",
        balance: "💰 余额:",
        next: "下一个:",
        controls: "控制:",
        controls_text: "Enter/S: 开始游戏 | 箭头键: 移动/下落 | 空格: 瞬间下落 | P: 暂停 | G: 切换网格 | T: 接管控制 (AI模式)",
        
        // Buttons
        start_game: "开始游戏",
        ai_vs_ai_mode: "AI对战模式",
        tournament_mode: "锦标赛模式",
        hide_grid: "隐藏网格",
        show_grid: "显示网格",
        sound_on: "声音",
        sound_off: "静音",
        install_app: "安装应用",
        achievements: "🏆 成就",
        share: "📤 分享",
        language_btn: "🌐 语言",
        
        // AI Insight
        ai_insight: "AI洞察:",
        ai_observing: "自适应引擎正在观察你的移动。",
        
        // AI vs AI Panel
        ai_player_1: "AI玩家1 (红色)",
        ai_player_2: "AI玩家2 (蓝色)",
        ai_analyzing: "AI正在分析...",
        ai_planning: "计划下一步行动...",
        take_control: "接管控制",
        exit_ai_mode: "退出AI模式",
        current_turn: "当前回合:",
        ai_1_turn: "AI 1的回合",
        ai_2_turn: "AI 2的回合",
        
        // Betting Panel
        place_bet: "🎲 下注!",
        time_remaining: "剩余时间:",
        seconds: "秒",
        tournament: "🏆 锦标赛",
        match: "比赛",
        of: "/",
        jackpot: "奖池:",
        
        // Bet Types
        bet_winner: "🏆 获胜者",
        bet_winner_desc: "押注比赛获胜者",
        bet_first_tetris: "⚡ 第一个Tetris",
        bet_first_tetris_desc: "谁先获得4行",
        bet_score_range: "🎯 分数范围",
        bet_score_range_desc: "猜测最终分数范围",
        bet_score_race: "🏃 分数竞赛",
        bet_score_race_desc: "谁先达到1000分",
        
        bet_amount: "💰 投注金额:",
        custom_amount: "自定义金额",
        place_bet_btn: "下注",
        skip: "跳过",
        
        // Achievements
        achievements_title: "🏆 成就",
        achievements_progress: "进度:",
        leaderboard: "📊 排行榜",
        
        achievement_lucky: "🍀 幸运儿",
        achievement_lucky_desc: "连续5次投注获胜",
        achievement_analyst: "🔮 分析师",
        achievement_analyst_desc: "猜中10个获胜者",
        achievement_rich: "💎 富豪",
        achievement_rich_desc: "累积10000 TC",
        achievement_sniper: "🎯 狙击手",
        achievement_sniper_desc: "准确猜中分数范围3次",
        achievement_streak: "🔥 连胜",
        achievement_streak_desc: "在你的游戏中连续3个Tetris",
        
        // Team Tournament
        team_tournament_mode: "团队锦标赛",
        team_tournament_title: "🏆 团队锦标赛系统",
        team_management: "团队管理",
        tournament_setup: "锦标赛设置",
        active_tournament: "活跃锦标赛",
        create_team: "创建团队",
        team_name: "团队名称",
        team_size: "团队规模",
        players: "玩家",
        create_team_btn: "创建团队",
        delete_team: "删除",
        select_teams: "选择锦标赛团队",
        start_tournament: "开始锦标赛",
        my_teams: "我的团队",
        team_stats: "团队统计",
        matches_played: "已比赛场次",
        matches_won: "获胜场次",
        avg_score: "平均分",
        match_round: "回合",
        team_vs_team: "对",
        play_round: "进行回合",
        next_match: "下一场比赛",
        complete_tournament: "完成锦标赛",
        tournament_winner: "锦标赛冠军",
        total_score: "总分",
        rounds_won: "获胜回合",
        back_to_menu: "返回菜单",
        
        // Footer
        footer_disclaimer: "🎮 这是一款虚拟货币游戏。不使用真实货币。仅供娱乐!",
    },
    
    ru: {
        // Language Selection Screen
        select_language: "Выберите язык / Select Language",
        
        // Rules Screen
        rules_title: "Как играть",
        rules_how_to_play: "Как играть",
        rules_controls: "Управление:",
        rules_arrow_left_right: "← → Стрелки влево/вправо - двигать фигуры",
        rules_arrow_up: "↑ Стрелка вверх - повернуть фигуру",
        rules_arrow_down: "↓ Стрелка вниз - ускорить падение",
        rules_space: "Пробел - мгновенное падение",
        rules_mobile: "Мобильные: свайпы и тапы для управления",
        
        rules_tetricoins: "Система TetriCoins:",
        rules_initial_balance: "Начальный баланс: 1000 TC",
        rules_daily_bonus: "Ежедневный бонус: +100 TC",
        rules_line_rewards: "Награды за линии:",
        rules_1_line: "1 линия = 10 TC",
        rules_2_lines: "2 линии = 30 TC",
        rules_3_lines: "3 линии = 100 TC",
        rules_4_lines: "4 линии (Tetris) = 500 TC",
        
        rules_ai_mode: "Режим AI против AI:",
        rules_ai_betting: "Делайте ставки на победителя",
        rules_ai_bet_types: "4 типа ставок с разными коэффициентами",
        rules_ai_tournament: "Турнирный режим с джекпотом",
        
        rules_disclaimer: "Дисклеймер:",
        rules_disclaimer_text: "Это игра на виртуальную валюту. Реальные деньги не используются. Только для развлечения!",
        
        start_playing: "Начать играть!",
        
        // Game Interface
        score: "Счёт:",
        level: "Уровень:",
        lines: "Линии:",
        high_score: "Рекорд:",
        balance: "💰 Баланс:",
        next: "Далее:",
        controls: "Управление:",
        controls_text: "Enter/S: Начать игру | Стрелки: Движение/Падение | Пробел: Мгновенное падение | P: Пауза | G: Переключить сетку | T: Взять управление (AI режим)",
        
        // Buttons
        start_game: "Начать игру",
        ai_vs_ai_mode: "Режим AI против AI",
        tournament_mode: "Турнирный режим",
        hide_grid: "Скрыть сетку",
        show_grid: "Показать сетку",
        sound_on: "Звук",
        sound_off: "Без звука",
        install_app: "Установить приложение",
        achievements: "🏆 Достижения",
        share: "📤 Поделиться",
        language_btn: "🌐 Язык",
        
        // AI Insight
        ai_insight: "AI Инсайт:",
        ai_observing: "Адаптивный движок наблюдает за вашими ходами.",
        
        // AI vs AI Panel
        ai_player_1: "AI Игрок 1 (Красный)",
        ai_player_2: "AI Игрок 2 (Синий)",
        ai_analyzing: "AI анализирует...",
        ai_planning: "Планирует следующий ход...",
        take_control: "Взять управление",
        exit_ai_mode: "Выйти из режима AI",
        current_turn: "Текущий ход:",
        ai_1_turn: "Ход AI 1",
        ai_2_turn: "Ход AI 2",
        
        // Betting Panel
        place_bet: "🎲 Сделайте ставку!",
        time_remaining: "Времени осталось:",
        seconds: "сек",
        tournament: "🏆 Турнир",
        match: "Матч",
        of: "из",
        jackpot: "Джекпот:",
        
        // Bet Types
        bet_winner: "🏆 Победитель",
        bet_winner_desc: "Ставка на победителя матча",
        bet_first_tetris: "⚡ Первый Tetris",
        bet_first_tetris_desc: "Кто первым соберёт 4 линии",
        bet_score_range: "🎯 Диапазон очков",
        bet_score_range_desc: "Угадайте диапазон финального счёта",
        bet_score_race: "🏃 Гонка очков",
        bet_score_race_desc: "Кто первым достигнет 1000 очков",
        
        bet_amount: "💰 Сумма ставки:",
        custom_amount: "Своя сумма",
        place_bet_btn: "Сделать ставку",
        skip: "Пропустить",
        
        // Achievements
        achievements_title: "🏆 Достижения",
        achievements_progress: "Прогресс:",
        leaderboard: "📊 Таблица лидеров",
        
        achievement_lucky: "🍀 Везунчик",
        achievement_lucky_desc: "5 выигрышных ставок подряд",
        achievement_analyst: "🔮 Аналитик",
        achievement_analyst_desc: "Угадал 10 победителей",
        achievement_rich: "💎 Богач",
        achievement_rich_desc: "Накопил 10000 TC",
        achievement_sniper: "🎯 Снайпер",
        achievement_sniper_desc: "Угадал точный диапазон очков 3 раза",
        achievement_streak: "🔥 На волне",
        achievement_streak_desc: "3 Tetris подряд в своей игре",
        
        // Team Tournament
        team_tournament_mode: "Командный турнир",
        team_tournament_title: "🏆 Система командных турниров",
        team_management: "Управление командами",
        tournament_setup: "Настройка турнира",
        active_tournament: "Активный турнир",
        create_team: "Создать команду",
        team_name: "Название команды",
        team_size: "Размер команды",
        players: "Игроки",
        create_team_btn: "Создать команду",
        delete_team: "Удалить",
        select_teams: "Выбрать команды для турнира",
        start_tournament: "Начать турнир",
        my_teams: "Мои команды",
        team_stats: "Статистика команды",
        matches_played: "Сыграно матчей",
        matches_won: "Выиграно матчей",
        avg_score: "Средний счёт",
        match_round: "Раунд",
        team_vs_team: "против",
        play_round: "Играть раунд",
        next_match: "Следующий матч",
        complete_tournament: "Завершить турнир",
        tournament_winner: "Победитель турнира",
        total_score: "Общий счёт",
        rounds_won: "Выиграно раундов",
        back_to_menu: "Назад в меню",
        
        // Footer
        footer_disclaimer: "🎮 Это игра на виртуальную валюту. Реальные деньги не используются. Только для развлечения!",
    }
};

// Apply translations to the page
function applyTranslations(lang) {
    const selectedLang = translations[lang] || translations['en'];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (selectedLang[key]) {
            // For input placeholders
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = selectedLang[key];
            } else {
                el.textContent = selectedLang[key];
            }
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Set RTL for Arabic
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
    } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
    }
}

// Get translation by key
function getTranslation(key, lang) {
    const currentLang = lang || getCurrentLanguage();
    const selectedLang = translations[currentLang] || translations['en'];
    return selectedLang[key] || key;
}

// Get current language from localStorage
function getCurrentLanguage() {
    return localStorage.getItem('tetrisLanguage') || 'en';
}

// Set current language
function setCurrentLanguage(lang) {
    localStorage.setItem('tetrisLanguage', lang);
    applyTranslations(lang);
}
