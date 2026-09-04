Функция CreateSession(Seed = 1) Экспорт
    Session = Новый Структура;
    Session.Вставить("TickIndex", 0);
    Session.Вставить("Mode", "single");
    Session.Вставить("AiPlayer", 1);
    Session.Вставить("GameState", TetrisGameLogic.CreateGameState(Seed));
    Session.Вставить("EconomyState", TetrisEconomy.CreateEconomyState());
    Session.Вставить("TrainerState", TetrisAiCoach.CreateTrainerState());
    Session.Вставить("ReplayState", TetrisReplay.CreateReplay(Seed));
    Session.Вставить("Tournament", Неопределено);
    Session.Вставить("LastReward", 0);
    Session.Вставить("LastPayout", 0);
    Session.Вставить("LastMessage", "Ready");
    Session.Вставить("LiveHint", "AI trainer is observing your board.");
    Возврат Session;
КонецФункции

Процедура StartNewGame(Session, Seed = Неопределено) Экспорт
    Если Seed = Неопределено Тогда
        Seed = Session.ReplayState.Seed + Session.TickIndex + 1;
    КонецЕсли;

    Session.GameState = TetrisGameLogic.CreateGameState(Seed, Session.TrainerState.Weights);
    Session.ReplayState = TetrisReplay.CreateReplay(Seed);
    Session.TickIndex = 0;
    Session.Mode = "single";
    Session.AiPlayer = 1;
    Session.LastReward = 0;
    Session.LastPayout = 0;
    Session.LastMessage = "New game started";
    Session.LiveHint = TetrisAiCoach.GetLiveHint(Session.TrainerState, Session.GameState);
КонецПроцедуры

Процедура TogglePause(Session) Экспорт
    Session.GameState.Paused = Не Session.GameState.Paused;
КонецПроцедуры

Функция HandleCommand(Session, CommandName) Экспорт
    Session.TickIndex = Session.TickIndex + 1;
    TetrisReplay.RecordCommand(Session.ReplayState, Session.TickIndex, CommandName);

    BeforeMetrics = TetrisAiCoach.AnalyzeBoard(Session.GameState.Board);
    LockResult = Неопределено;

    Если CommandName = "left" Тогда
        TetrisGameLogic.MovePiece(Session.GameState, -1, 0);
    ИначеЕсли CommandName = "right" Тогда
        TetrisGameLogic.MovePiece(Session.GameState, 1, 0);
    ИначеЕсли CommandName = "down" Тогда
        LockResult = ExecuteSoftDrop(Session);
    ИначеЕсли CommandName = "rotate" Тогда
        TetrisGameLogic.RotatePiece(Session.GameState);
    ИначеЕсли CommandName = "drop" Тогда
        LockResult = TetrisGameLogic.HardDrop(Session.GameState, Session.TrainerState.Weights);
    ИначеЕсли CommandName = "tick" Тогда
        LockResult = TetrisGameLogic.Tick(Session.GameState, Session.TrainerState.Weights);
    ИначеЕсли CommandName = "pause" Тогда
        TogglePause(Session);
    КонецЕсли;

    Если LockResult <> Неопределено Тогда
        ApplyPostLockEffects(Session, BeforeMetrics, LockResult);
    КонецЕсли;

    Session.LiveHint = TetrisAiCoach.GetLiveHint(Session.TrainerState, Session.GameState);
    Возврат BuildUiSnapshot(Session);
КонецФункции

Процедура StartAiMatch(Session) Экспорт
    StartNewGame(Session, Session.GameState.RandomSeed + 100);
    Session.Mode = "ai-vs-ai";
    Session.AiPlayer = 1;
    Session.LastMessage = "AI match started";
КонецПроцедуры

Функция ExecuteAiTurn(Session) Экспорт
    Move = TetrisAiCoach.FindBestMove(Session.GameState, Session.AiPlayer);
    Если Move = Неопределено Тогда
        Возврат BuildUiSnapshot(Session);
    КонецЕсли;

    Piece = Session.GameState.CurrentPiece;
    OriginalRotation = Piece.Rotation;
    OriginalMatrix = Piece.Matrix;
    OriginalX = Piece.X;
    Piece.Rotation = Move.Rotation;
    Piece.Matrix = Piece.Variants[Move.Rotation];
    Piece.X = Move.TargetX;

    Если Не TetrisGameLogic.IsValidPosition(Session.GameState.Board, Piece) Тогда
        Piece.Rotation = OriginalRotation;
        Piece.Matrix = OriginalMatrix;
        Piece.X = OriginalX;
        Если Не TetrisGameLogic.IsValidPosition(Session.GameState.Board, Piece) Тогда
            Session.LastMessage = "AI could not find a safe move";
            Возврат BuildUiSnapshot(Session);
        КонецЕсли;
    КонецЕсли;

    HandleCommand(Session, "drop");
    Session.AiPlayer = ?(Session.AiPlayer = 1, 2, 1);
    Session.LastMessage = "AI turn completed";
    Возврат BuildUiSnapshot(Session);
КонецФункции

Процедура CreateTournament(Session, Participants, TeamMode = Ложь) Экспорт
    Session.Tournament = TetrisEconomy.CreateTournament(Participants, TeamMode);
    Session.Mode = ?(TeamMode, "team-tournament", "tournament");
    Session.LastMessage = "Tournament created";
КонецПроцедуры

Функция AdvanceTournament(Session, WinnerName) Экспорт
    Если Session.Tournament = Неопределено Тогда
        Возврат Ложь;
    КонецЕсли;

    Success = TetrisEconomy.CompleteTournamentMatch(Session.Tournament, WinnerName);
    Если Success Тогда
        Session.LastMessage = "Tournament bracket updated";
    КонецЕсли;

    Возврат Success;
КонецФункции

Процедура AttachChallenge(Session, TargetScore, TargetLevel = 1) Экспорт
    Session.ReplayState.Challenge = TetrisReplay.CreateChallenge(TargetScore, TargetLevel);
КонецПроцедуры

Функция BuildUiSnapshot(Session) Экспорт
    Snapshot = Новый Структура;
    Snapshot.Вставить("Board", TetrisGameLogic.BuildBoardSnapshot(Session.GameState, Истина));
    Snapshot.Вставить("NextPiece", Session.GameState.NextPieceName);
    Snapshot.Вставить("Score", Session.GameState.Score);
    Snapshot.Вставить("Lines", Session.GameState.Lines);
    Snapshot.Вставить("Level", Session.GameState.Level);
    Snapshot.Вставить("Balance", Session.EconomyState.Balance);
    Snapshot.Вставить("Mode", Session.Mode);
    Snapshot.Вставить("Hint", Session.LiveHint);
    Snapshot.Вставить("LastMessage", Session.LastMessage);
    Snapshot.Вставить("GameOver", Session.GameState.GameOver);
    Snapshot.Вставить("ChallengeWon", TetrisReplay.IsChallengeCompleted(Session.ReplayState.Challenge, Session.GameState.Score, Session.GameState.Level));
    Возврат Snapshot;
КонецФункции

Функция ExecuteSoftDrop(Session)
    Если TetrisGameLogic.MovePiece(Session.GameState, 0, 1, Истина) Тогда
        Возврат Неопределено;
    КонецЕсли;

    Возврат TetrisGameLogic.LockCurrentPiece(Session.GameState, 0, Session.TrainerState.Weights);
КонецФункции

Процедура ApplyPostLockEffects(Session, BeforeMetrics, LockResult)
    Если Не ПустаяСтрока(LockResult.PieceName) Тогда
        AfterMetrics = TetrisAiCoach.AnalyzeBoard(Session.GameState.Board);
        TetrisAiCoach.RegisterPlacement(Session.TrainerState, LockResult.PieceName, BeforeMetrics, AfterMetrics, LockResult.LinesCleared);
    КонецЕсли;

    Session.LastReward = TetrisEconomy.ApplyLineReward(Session.EconomyState, LockResult.LinesCleared);

    Если TetrisReplay.IsChallengeCompleted(Session.ReplayState.Challenge, Session.GameState.Score, Session.GameState.Level) Тогда
        TetrisEconomy.AddCoins(Session.EconomyState, Session.ReplayState.Challenge.Reward);
        Session.LastReward = Session.LastReward + Session.ReplayState.Challenge.Reward;
        Session.ReplayState.Challenge = Неопределено;
        Session.LastMessage = "Challenge completed";
    ИначеЕсли Session.GameState.GameOver Тогда
        TetrisEconomy.RegisterScore(Session.EconomyState, "Player", Session.GameState.Score);
        Session.LastMessage = "Game over";
    ИначеЕсли LockResult.LinesCleared > 0 Тогда
        Session.LastMessage = "Lines cleared: " + Формат(LockResult.LinesCleared, "ЧГ=0");
    КонецЕсли;
КонецПроцедуры
