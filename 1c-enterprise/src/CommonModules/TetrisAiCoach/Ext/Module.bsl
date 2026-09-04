Функция CreateTrainerState() Экспорт
    Weights = Новый Структура("I,J,L,O,S,T,Z", 1, 1, 1, 1, 1, 1, 1);
    State = Новый Структура;
    State.Вставить("Weights", Weights);
    State.Вставить("LastHint", "AI trainer is observing your board.");
    State.Вставить("LastMetrics", Неопределено);
    Возврат State;
КонецФункции

Функция AnalyzeBoard(Board) Экспорт
    Width = Board[0].Количество();
    Height = Board.Количество();
    Heights = Новый Массив;
    Holes = 0;
    AggregateHeight = 0;
    MaxHeight = 0;

    Для ColIndex = 0 По Width - 1 Цикл
        ColumnHeight = 0;
        BlockFound = Ложь;

        Для RowIndex = 0 По Height - 1 Цикл
            IsFilled = Не ПустаяСтрока(Board[RowIndex][ColIndex]);
            Если IsFilled И Не BlockFound Тогда
                ColumnHeight = Height - RowIndex;
                BlockFound = Истина;
            КонецЕсли;

            Если BlockFound И Не IsFilled Тогда
                Holes = Holes + 1;
            КонецЕсли;
        КонецЦикла;

        Heights.Добавить(ColumnHeight);
        AggregateHeight = AggregateHeight + ColumnHeight;
        Если ColumnHeight > MaxHeight Тогда
            MaxHeight = ColumnHeight;
        КонецЕсли;
    КонецЦикла;

    Bumpiness = 0;
    Для ColIndex = 0 По Heights.Количество() - 2 Цикл
        Bumpiness = Bumpiness + Модуль(Heights[ColIndex] - Heights[ColIndex + 1]);
    КонецЦикла;

    Metrics = Новый Структура;
    Metrics.Вставить("Heights", Heights);
    Metrics.Вставить("Holes", Holes);
    Metrics.Вставить("AggregateHeight", AggregateHeight);
    Metrics.Вставить("MaxHeight", MaxHeight);
    Metrics.Вставить("Bumpiness", Bumpiness);
    Возврат Metrics;
КонецФункции

Процедура RegisterPlacement(TrainerState, PieceName, BeforeMetrics, AfterMetrics, LinesCleared) Экспорт
    Weight = 1;
    TrainerState.Weights.Свойство(PieceName, Weight);

    Penalty = 0;
    Reward = LinesCleared * 0.3;

    Если AfterMetrics.Holes > BeforeMetrics.Holes Тогда
        Penalty = Penalty + (AfterMetrics.Holes - BeforeMetrics.Holes) * 0.25;
    КонецЕсли;

    Если AfterMetrics.MaxHeight > BeforeMetrics.MaxHeight Тогда
        Penalty = Penalty + (AfterMetrics.MaxHeight - BeforeMetrics.MaxHeight) * 0.1;
    КонецЕсли;

    Если AfterMetrics.Bumpiness > BeforeMetrics.Bumpiness Тогда
        Penalty = Penalty + (AfterMetrics.Bumpiness - BeforeMetrics.Bumpiness) * 0.03;
    КонецЕсли;

    NewWeight = Weight + Penalty - Reward;
    Если NewWeight < 0.4 Тогда
        NewWeight = 0.4;
    КонецЕсли;
    Если NewWeight > 8 Тогда
        NewWeight = 8;
    КонецЕсли;

    TrainerState.Weights.Вставить(PieceName, NewWeight);
    TrainerState.LastMetrics = AfterMetrics;
    TrainerState.LastHint = BuildHintFromMetrics(AfterMetrics);
КонецПроцедуры

Функция ChooseAdaptivePieceName(TrainerState, GameState) Экспорт
    Возврат TetrisGameLogic.SelectNextPieceName(GameState, TrainerState.Weights);
КонецФункции

Функция BuildHintFromMetrics(Metrics) Экспорт
    Если Metrics.Holes >= 5 Тогда
        Возврат "AI insight: reduce holes and avoid covering open cells.";
    КонецЕсли;

    Если Metrics.MaxHeight >= 15 Тогда
        Возврат "AI insight: your stack is too high, prioritize emergency clears.";
    КонецЕсли;

    Если Metrics.Bumpiness >= 12 Тогда
        Возврат "AI insight: smooth the skyline before chasing a Tetris.";
    КонецЕсли;

    Возврат "AI insight: the board is stable, you can prepare for larger combos.";
КонецФункции

Функция GetLiveHint(TrainerState, GameState) Экспорт
    Metrics = AnalyzeBoard(GameState.Board);
    TrainerState.LastMetrics = Metrics;
    TrainerState.LastHint = BuildHintFromMetrics(Metrics);
    Возврат TrainerState.LastHint;
КонецФункции

Функция FindBestMove(GameState, AiPlayerNumber = 1) Экспорт
    Piece = GameState.CurrentPiece;
    Если Piece = Неопределено Тогда
        Возврат Неопределено;
    КонецЕсли;

    BestMove = Неопределено;
    BestScore = -999999;
    Width = GameState.Width;
    Height = GameState.Height;

    Для RotationIndex = 0 По Piece.Variants.Количество() - 1 Цикл
        Для TargetX = -2 По Width - 1 Цикл
            Simulation = TetrisGameLogic.SimulatePlacement(GameState.Board, Piece, RotationIndex, TargetX, Width, Height);
            Если Simulation = Неопределено Тогда
                Продолжить;
            КонецЕсли;

            Metrics = AnalyzeBoard(Simulation.Board);
            Score = EvaluateSimulation(Simulation.LinesCleared, Metrics, AiPlayerNumber);

            Если Score > BestScore Тогда
                BestScore = Score;
                BestMove = Новый Структура;
                BestMove.Вставить("Rotation", RotationIndex);
                BestMove.Вставить("TargetX", TargetX);
                BestMove.Вставить("Score", Score);
            КонецЕсли;
        КонецЦикла;
    КонецЦикла;

    Возврат BestMove;
КонецФункции

Функция EvaluateSimulation(LinesCleared, Metrics, AiPlayerNumber)
    Если AiPlayerNumber = 1 Тогда
        Возврат LinesCleared * 900 - Metrics.Holes * 140 - Metrics.MaxHeight * 16 - Metrics.Bumpiness * 10;
    КонецЕсли;

    Возврат LinesCleared * 700 - Metrics.Holes * 100 - Metrics.AggregateHeight * 5 - Metrics.Bumpiness * 6;
КонецФункции
