Перем Session;

Процедура OnCreateAtServer(Отказ, СтандартнаяОбработка)
    Session = TetrisSessionManager.CreateSession(1);
КонецПроцедуры

Процедура OnOpen(Отказ)
    TetrisEconomy.ApplyDailyBonus(Session.EconomyState);
    RefreshView();
КонецПроцедуры

Процедура StartCommand(Команда)
    TetrisSessionManager.StartNewGame(Session);
    RefreshView();
КонецПроцедуры

Процедура AiMatchCommand(Команда)
    TetrisSessionManager.StartAiMatch(Session);
    RefreshView();
КонецПроцедуры

Процедура PauseCommand(Команда)
    TetrisSessionManager.TogglePause(Session);
    RefreshView();
КонецПроцедуры

Процедура LeftCommand(Команда)
    TetrisSessionManager.HandleCommand(Session, "left");
    RefreshView();
КонецПроцедуры

Процедура RightCommand(Команда)
    TetrisSessionManager.HandleCommand(Session, "right");
    RefreshView();
КонецПроцедуры

Процедура RotateCommand(Команда)
    TetrisSessionManager.HandleCommand(Session, "rotate");
    RefreshView();
КонецПроцедуры

Процедура DownCommand(Команда)
    TetrisSessionManager.HandleCommand(Session, "down");
    RefreshView();
КонецПроцедуры

Процедура DropCommand(Команда)
    TetrisSessionManager.HandleCommand(Session, "drop");
    RefreshView();
КонецПроцедуры

Процедура OnTimer()
    Если Session = Неопределено Тогда
        Возврат;
    КонецЕсли;

    Если Session.Mode = "ai-vs-ai" Тогда
        TetrisSessionManager.ExecuteAiTurn(Session);
    Иначе
        TetrisSessionManager.HandleCommand(Session, "tick");
    КонецЕсли;

    RefreshView();
КонецПроцедуры

Процедура RefreshView()
    Snapshot = TetrisSessionManager.BuildUiSnapshot(Session);
    Если Элементы.Найти("FieldView") <> Неопределено Тогда
        Элементы.FieldView.Значение = RenderBoardAsText(Snapshot.Board);
    КонецЕсли;

    Если Элементы.Найти("NextPieceView") <> Неопределено Тогда
        Элементы.NextPieceView.Значение = Snapshot.NextPiece;
    КонецЕсли;

    Если Элементы.Найти("StatusLabel") <> Неопределено Тогда
        Элементы.StatusLabel.Значение =
            "Score: " + Формат(Snapshot.Score, "ЧГ=0") + Символы.ПС
            + "Lines: " + Формат(Snapshot.Lines, "ЧГ=0") + Символы.ПС
            + "Level: " + Формат(Snapshot.Level, "ЧГ=0") + Символы.ПС
            + "Balance: " + Формат(Snapshot.Balance, "ЧГ=0");
    КонецЕсли;

    Если Элементы.Найти("HintLabel") <> Неопределено Тогда
        Элементы.HintLabel.Значение = Snapshot.Hint;
    КонецЕсли;

    Если Элементы.Найти("ModeLabel") <> Неопределено Тогда
        Элементы.ModeLabel.Значение = Snapshot.Mode + ": " + Snapshot.LastMessage;
    КонецЕсли;
КонецПроцедуры

Функция RenderBoardAsText(Board)
    Lines = Новый Массив;
    Для Каждого Row Из Board Цикл
        Cells = "";
        Для Каждого CellValue Из Row Цикл
            Если ПустаяСтрока(CellValue) Тогда
                Cells = Cells + "·";
            ИначеЕсли Лев(CellValue, 6) = "ghost-" Тогда
                Cells = Cells + "□";
            Иначе
                Cells = Cells + "■";
            КонецЕсли;
        КонецЦикла;
        Lines.Добавить(Cells);
    КонецЦикла;

    Возврат СтрСоединить(Lines, Символы.ПС);
КонецФункции
