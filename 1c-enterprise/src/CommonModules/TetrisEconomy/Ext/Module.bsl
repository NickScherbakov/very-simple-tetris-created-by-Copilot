Функция CreateEconomyState() Экспорт
    Themes = Новый Структура("Classic,Ocean,Inferno,Matrix,Neon,Pastel,Gold,Rainbow", Истина, Ложь, Ложь, Ложь, Ложь, Ложь, Ложь, Ложь);

    State = Новый Структура;
    State.Вставить("Balance", 1000);
    State.Вставить("LastDailyBonusDate", Неопределено);
    State.Вставить("Themes", Themes);
    State.Вставить("Achievements", Новый Массив);
    State.Вставить("CurrentBet", Неопределено);
    State.Вставить("TournamentJackpot", 0);
    State.Вставить("Leaderboard", Новый Массив);
    Возврат State;
КонецФункции

Функция ApplyDailyBonus(State, CurrentDate = Неопределено) Экспорт
    Today = NormalizeDate(CurrentDate);
    Если State.LastDailyBonusDate = Today Тогда
        Возврат 0;
    КонецЕсли;

    State.LastDailyBonusDate = Today;
    State.Balance = State.Balance + 100;
    Возврат 100;
КонецФункции

Функция CanAfford(State, Amount) Экспорт
    Возврат State.Balance >= Amount;
КонецФункции

Функция DeductCoins(State, Amount) Экспорт
    Если Не CanAfford(State, Amount) Тогда
        Возврат Ложь;
    КонецЕсли;

    State.Balance = State.Balance - Amount;
    Возврат Истина;
КонецФункции

Процедура AddCoins(State, Amount) Экспорт
    State.Balance = State.Balance + Amount;
КонецПроцедуры

Функция RewardForClearedLines(LinesCleared) Экспорт
    Если LinesCleared = 1 Тогда
        Возврат 10;
    ИначеЕсли LinesCleared = 2 Тогда
        Возврат 30;
    ИначеЕсли LinesCleared = 3 Тогда
        Возврат 100;
    ИначеЕсли LinesCleared >= 4 Тогда
        Возврат 500;
    КонецЕсли;

    Возврат 0;
КонецФункции

Функция ApplyLineReward(State, LinesCleared) Экспорт
    Reward = RewardForClearedLines(LinesCleared);
    AddCoins(State, Reward);
    Возврат Reward;
КонецФункции

Функция UnlockTheme(State, ThemeName, Price) Экспорт
    IsUnlocked = Ложь;
    State.Themes.Свойство(ThemeName, IsUnlocked);

    Если IsUnlocked Тогда
        Возврат Новый Структура("Success,Message", Истина, "Theme already unlocked.");
    КонецЕсли;

    Если Не DeductCoins(State, Price) Тогда
        Возврат Новый Структура("Success,Message", Ложь, "Not enough TetriCoins.");
    КонецЕсли;

    State.Themes.Вставить(ThemeName, Истина);
    Возврат Новый Структура("Success,Message", Истина, "Theme unlocked.");
КонецФункции

Функция PlaceBet(State, BetType, Target, Amount, Odds) Экспорт
    Если Не DeductCoins(State, Amount) Тогда
        Возврат Новый Структура("Success,Message", Ложь, "Not enough balance for this bet.");
    КонецЕсли;

    Bet = Новый Структура;
    Bet.Вставить("BetType", BetType);
    Bet.Вставить("Target", Target);
    Bet.Вставить("Amount", Amount);
    Bet.Вставить("Odds", Odds);
    State.CurrentBet = Bet;

    State.TournamentJackpot = State.TournamentJackpot + Цел(Amount / 2);
    Возврат Новый Структура("Success,Message", Истина, "Bet accepted.");
КонецФункции

Функция ResolveBet(State, ActualTarget) Экспорт
    Если State.CurrentBet = Неопределено Тогда
        Возврат 0;
    КонецЕсли;

    Payout = 0;
    Если State.CurrentBet.Target = ActualTarget Тогда
        Payout = Цел(State.CurrentBet.Amount * State.CurrentBet.Odds);
        AddCoins(State, Payout);
    КонецЕсли;

    State.CurrentBet = Неопределено;
    Возврат Payout;
КонецФункции

Процедура GrantAchievement(State, Code, Reward = 0) Экспорт
    Для Каждого ExistingCode Из State.Achievements Цикл
        Если ExistingCode = Code Тогда
            Возврат;
        КонецЕсли;
    КонецЦикла;

    State.Achievements.Добавить(Code);
    Если Reward > 0 Тогда
        AddCoins(State, Reward);
    КонецЕсли;
КонецПроцедуры

Процедура RegisterScore(State, PlayerName, ScoreValue) Экспорт
    Entry = Новый Структура;
    Entry.Вставить("PlayerName", PlayerName);
    Entry.Вставить("Score", ScoreValue);
    Entry.Вставить("RegisteredAt", ТекущаяДата());
    State.Leaderboard.Добавить(Entry);
КонецПроцедуры

Функция CreateTournament(Participants, TeamMode = Ложь) Экспорт
    Tournament = Новый Структура;
    Tournament.Вставить("Participants", Participants);
    Tournament.Вставить("TeamMode", TeamMode);
    Tournament.Вставить("CurrentMatchIndex", 0);
    Tournament.Вставить("Matches", BuildTournamentMatches(Participants));
    Tournament.Вставить("Completed", Ложь);
    Возврат Tournament;
КонецФункции

Функция GetCurrentMatch(Tournament) Экспорт
    Если Tournament = Неопределено Или Tournament.CurrentMatchIndex >= Tournament.Matches.Количество() Тогда
        Возврат Неопределено;
    КонецЕсли;

    Возврат Tournament.Matches[Tournament.CurrentMatchIndex];
КонецФункции

Функция CompleteTournamentMatch(Tournament, Winner) Экспорт
    Match = GetCurrentMatch(Tournament);
    Если Match = Неопределено Тогда
        Возврат Ложь;
    КонецЕсли;

    Match.Winner = Winner;
    Tournament.CurrentMatchIndex = Tournament.CurrentMatchIndex + 1;
    Если Tournament.CurrentMatchIndex >= Tournament.Matches.Количество() Тогда
        Tournament.Completed = Истина;
    КонецЕсли;

    Возврат Истина;
КонецФункции

Функция BuildTournamentMatches(Participants)
    Matches = Новый Массив;
    Для Index = 0 По Participants.Количество() - 2 Шаг 2 Цикл
        Match = Новый Структура;
        Match.Вставить("Left", Participants[Index]);
        Match.Вставить("Right", Participants[Index + 1]);
        Match.Вставить("Winner", Неопределено);
        Matches.Добавить(Match);
    КонецЦикла;
    Возврат Matches;
КонецФункции

Функция NormalizeDate(CurrentDate)
    Если CurrentDate = Неопределено Тогда
        CurrentDate = ТекущаяДата();
    КонецЕсли;
    Возврат НачалоДня(CurrentDate);
КонецФункции
