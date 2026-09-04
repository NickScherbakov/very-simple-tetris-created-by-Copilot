Функция CreateReplay(RandomSeed) Экспорт
    Replay = Новый Структура;
    Replay.Вставить("Seed", RandomSeed);
    Replay.Вставить("StartedAt", ТекущаяДата());
    Replay.Вставить("Commands", Новый Массив);
    Replay.Вставить("Challenge", Неопределено);
    Возврат Replay;
КонецФункции

Процедура RecordCommand(Replay, TickIndex, CommandName) Экспорт
    Command = Новый Структура;
    Command.Вставить("Tick", TickIndex);
    Command.Вставить("Command", CommandName);
    Replay.Commands.Добавить(Command);
КонецПроцедуры

Функция ExportReplay(Replay) Экспорт
    Возврат ЗначениеВСтрокуВнутр(Replay);
КонецФункции

Функция ImportReplay(SerializedReplay) Экспорт
    Возврат ЗначениеИзСтрокиВнутр(SerializedReplay);
КонецФункции

Функция CreateChallenge(TargetScore, TargetLevel = 1, Reward = 500) Экспорт
    Challenge = Новый Структура;
    Challenge.Вставить("TargetScore", TargetScore);
    Challenge.Вставить("TargetLevel", TargetLevel);
    Challenge.Вставить("Reward", Reward);
    Возврат Challenge;
КонецФункции

Функция IsChallengeCompleted(Challenge, ScoreValue, LevelValue) Экспорт
    Если Challenge = Неопределено Тогда
        Возврат Ложь;
    КонецЕсли;

    Возврат ScoreValue >= Challenge.TargetScore И LevelValue >= Challenge.TargetLevel;
КонецФункции
