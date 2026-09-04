Функция CreateGameState(Seed = 1, AdaptiveWeights = Неопределено) Экспорт
    State = Новый Структура;
    State.Вставить("Width", 10);
    State.Вставить("Height", 20);
    State.Вставить("Board", CreateEmptyBoard(10, 20));
    State.Вставить("Score", 0);
    State.Вставить("Lines", 0);
    State.Вставить("Level", 1);
    State.Вставить("GameOver", Ложь);
    State.Вставить("Paused", Ложь);
    State.Вставить("DropInterval", 1000);
    State.Вставить("ShowGhost", Истина);
    State.Вставить("RandomSeed", NormalizeSeed(Seed));
    State.Вставить("CurrentPiece", Неопределено);
    State.Вставить("NextPieceName", SelectNextPieceName(State, AdaptiveWeights));
    SpawnNextPiece(State, AdaptiveWeights);
    Возврат State;
КонецФункции

Функция CreateEmptyBoard(Width, Height) Экспорт
    Board = Новый Массив;
    Для RowIndex = 0 По Height - 1 Цикл
        Board.Добавить(CreateEmptyRow(Width));
    КонецЦикла;
    Возврат Board;
КонецФункции

Функция CloneBoard(Board) Экспорт
    Result = Новый Массив;
    Для Каждого Row Из Board Цикл
        Result.Добавить(CopyRow(Row));
    КонецЦикла;
    Возврат Result;
КонецФункции

Функция ClonePiece(Piece) Экспорт
    Если Piece = Неопределено Тогда
        Возврат Неопределено;
    КонецЕсли;

    Clone = Новый Структура;
    Clone.Вставить("Name", Piece.Name);
    Clone.Вставить("Color", Piece.Color);
    Clone.Вставить("Rotation", Piece.Rotation);
    Clone.Вставить("Variants", Piece.Variants);
    Clone.Вставить("Matrix", Piece.Matrix);
    Clone.Вставить("X", Piece.X);
    Clone.Вставить("Y", Piece.Y);
    Возврат Clone;
КонецФункции

Функция SelectNextPieceName(State, AdaptiveWeights = Неопределено) Экспорт
    PieceNames = GetPieceNames();
    TotalWeight = 0;

    Для Каждого PieceName Из PieceNames Цикл
        TotalWeight = TotalWeight + GetPieceWeight(PieceName, AdaptiveWeights);
    КонецЦикла;

    Target = NextRandom(State) * TotalWeight;
    Cursor = 0;

    Для Каждого PieceName Из PieceNames Цикл
        Cursor = Cursor + GetPieceWeight(PieceName, AdaptiveWeights);
        Если Target <= Cursor Тогда
            Возврат PieceName;
        КонецЕсли;
    КонецЦикла;

    Возврат PieceNames[PieceNames.Количество() - 1];
КонецФункции

Процедура SpawnNextPiece(State, AdaptiveWeights = Неопределено) Экспорт
    PieceName = State.NextPieceName;
    Если ПустаяСтрока(PieceName) Тогда
        PieceName = SelectNextPieceName(State, AdaptiveWeights);
    КонецЕсли;

    State.CurrentPiece = CreatePiece(PieceName, State.Width);
    State.NextPieceName = SelectNextPieceName(State, AdaptiveWeights);

    Если Не IsValidPosition(State.Board, State.CurrentPiece) Тогда
        State.GameOver = Истина;
    КонецЕсли;
КонецПроцедуры

Функция CreatePiece(PieceName, BoardWidth) Экспорт
    PieceDefinition = GetPieceDefinition(PieceName);
    Piece = Новый Структура;
    Piece.Вставить("Name", PieceName);
    Piece.Вставить("Color", PieceDefinition.Color);
    Piece.Вставить("Rotation", 0);
    Piece.Вставить("Variants", PieceDefinition.Variants);
    Piece.Вставить("Matrix", PieceDefinition.Variants[0]);
    Piece.Вставить("X", Цел(BoardWidth / 2) - 2);
    Piece.Вставить("Y", 0);
    Возврат Piece;
КонецФункции

Функция IsValidPosition(Board, Piece, OffsetX = 0, OffsetY = 0, Matrix = Неопределено) Экспорт
    Если Piece = Неопределено Тогда
        Возврат Ложь;
    КонецЕсли;

    TestMatrix = Matrix;
    Если TestMatrix = Неопределено Тогда
        TestMatrix = Piece.Matrix;
    КонецЕсли;

    Height = Board.Количество();
    Width = Board[0].Количество();

    Для RowIndex = 0 По TestMatrix.Количество() - 1 Цикл
        Row = TestMatrix[RowIndex];
        Для ColIndex = 0 По Row.Количество() - 1 Цикл
            Если Row[ColIndex] = 0 Тогда
                Продолжить;
            КонецЕсли;

            X = Piece.X + ColIndex + OffsetX;
            Y = Piece.Y + RowIndex + OffsetY;

            Если X < 0 Или X >= Width Тогда
                Возврат Ложь;
            КонецЕсли;

            Если Y >= Height Тогда
                Возврат Ложь;
            КонецЕсли;

            Если Y >= 0 И Не ПустаяСтрока(Board[Y][X]) Тогда
                Возврат Ложь;
            КонецЕсли;
        КонецЦикла;
    КонецЦикла;

    Возврат Истина;
КонецФункции

Функция MovePiece(State, DeltaX, DeltaY, SoftDrop = Ложь) Экспорт
    Если State.GameOver Или State.Paused Тогда
        Возврат Ложь;
    КонецЕсли;

    Если IsValidPosition(State.Board, State.CurrentPiece, DeltaX, DeltaY) Тогда
        State.CurrentPiece.X = State.CurrentPiece.X + DeltaX;
        State.CurrentPiece.Y = State.CurrentPiece.Y + DeltaY;
        Если SoftDrop Тогда
            State.Score = State.Score + 1;
        КонецЕсли;
        Возврат Истина;
    КонецЕсли;

    Возврат Ложь;
КонецФункции

Функция RotatePiece(State) Экспорт
    Если State.GameOver Или State.Paused Или State.CurrentPiece = Неопределено Тогда
        Возврат Ложь;
    КонецЕсли;

    Piece = State.CurrentPiece;
    NextRotation = Остаток(Piece.Rotation + 1, Piece.Variants.Количество());
    NextMatrix = Piece.Variants[NextRotation];
    KickOffsets = Новый Массив;
    KickOffsets.Добавить(0);
    KickOffsets.Добавить(-1);
    KickOffsets.Добавить(1);
    KickOffsets.Добавить(-2);
    KickOffsets.Добавить(2);

    Для Каждого OffsetX Из KickOffsets Цикл
        Если IsValidPosition(State.Board, Piece, OffsetX, 0, NextMatrix) Тогда
            Piece.Rotation = NextRotation;
            Piece.Matrix = NextMatrix;
            Piece.X = Piece.X + OffsetX;
            Возврат Истина;
        КонецЕсли;
    КонецЦикла;

    Возврат Ложь;
КонецФункции

Функция HardDrop(State, AdaptiveWeights = Неопределено) Экспорт
    Если State.GameOver Или State.Paused Тогда
        Возврат Неопределено;
    КонецЕсли;

    DropDistance = 0;
    Пока IsValidPosition(State.Board, State.CurrentPiece, 0, 1) Цикл
        State.CurrentPiece.Y = State.CurrentPiece.Y + 1;
        DropDistance = DropDistance + 1;
    КонецЦикла;

    Возврат LockCurrentPiece(State, DropDistance * 2, AdaptiveWeights);
КонецФункции

Функция Tick(State, AdaptiveWeights = Неопределено) Экспорт
    Если State.GameOver Или State.Paused Тогда
        Возврат Неопределено;
    КонецЕсли;

    Если MovePiece(State, 0, 1) Тогда
        Возврат Неопределено;
    КонецЕсли;

    Возврат LockCurrentPiece(State, 0, AdaptiveWeights);
КонецФункции

Функция LockCurrentPiece(State, DropBonus = 0, AdaptiveWeights = Неопределено) Экспорт
    LockedPieceName = State.CurrentPiece.Name;
    MergePieceIntoBoard(State.Board, State.CurrentPiece);
    ClearResult = ClearCompletedLines(State.Board, State.Width, State.Height);
    State.Board = ClearResult.Board;

    ScoreDelta = CalculateLineScore(ClearResult.LinesCleared, State.Level) + DropBonus;
    State.Score = State.Score + ScoreDelta;
    State.Lines = State.Lines + ClearResult.LinesCleared;
    State.Level = CalculateLevel(State.Lines);
    State.DropInterval = CalculateDropInterval(State.Level);

    SpawnNextPiece(State, AdaptiveWeights);

    Возврат NewLockResult(ClearResult.LinesCleared, ScoreDelta, State.GameOver, LockedPieceName);
КонецФункции

Процедура MergePieceIntoBoard(Board, Piece) Экспорт
    Для RowIndex = 0 По Piece.Matrix.Количество() - 1 Цикл
        Row = Piece.Matrix[RowIndex];
        Для ColIndex = 0 По Row.Количество() - 1 Цикл
            Если Row[ColIndex] = 0 Тогда
                Продолжить;
            КонецЕсли;

            X = Piece.X + ColIndex;
            Y = Piece.Y + RowIndex;
            Если Y >= 0 Тогда
                Board[Y][X] = Piece.Color;
            КонецЕсли;
        КонецЦикла;
    КонецЦикла;
КонецПроцедуры

Функция ClearCompletedLines(Board, Width, Height) Экспорт
    SurvivingRows = Новый Массив;
    ClearedLines = 0;

    Для RowIndex = 0 По Height - 1 Цикл
        Row = Board[RowIndex];
        IsComplete = Истина;

        Для ColIndex = 0 По Width - 1 Цикл
            Если ПустаяСтрока(Row[ColIndex]) Тогда
                IsComplete = Ложь;
                Прервать;
            КонецЕсли;
        КонецЦикла;

        Если IsComplete Тогда
            ClearedLines = ClearedLines + 1;
        Иначе
            SurvivingRows.Добавить(CopyRow(Row));
        КонецЕсли;
    КонецЦикла;

    FinalBoard = Новый Массив;
    Для Counter = 1 По ClearedLines Цикл
        FinalBoard.Добавить(CreateEmptyRow(Width));
    КонецЦикла;

    Для Каждого Row Из SurvivingRows Цикл
        FinalBoard.Добавить(Row);
    КонецЦикла;

    Result = Новый Структура;
    Result.Вставить("Board", FinalBoard);
    Result.Вставить("LinesCleared", ClearedLines);
    Возврат Result;
КонецФункции

Функция GetGhostPiece(State) Экспорт
    Если Не State.ShowGhost Или State.CurrentPiece = Неопределено Тогда
        Возврат Неопределено;
    КонецЕсли;

    Ghost = ClonePiece(State.CurrentPiece);
    Пока IsValidPosition(State.Board, Ghost, 0, 1) Цикл
        Ghost.Y = Ghost.Y + 1;
    КонецЦикла;
    Возврат Ghost;
КонецФункции

Функция BuildBoardSnapshot(State, IncludeGhost = Истина) Экспорт
    Snapshot = CloneBoard(State.Board);
    Ghost = Неопределено;

    Если IncludeGhost Тогда
        Ghost = GetGhostPiece(State);
    КонецЕсли;

    Если Ghost <> Неопределено Тогда
        OverlayPiece(Snapshot, Ghost, "ghost-" + Ghost.Color);
    КонецЕсли;

    Если State.CurrentPiece <> Неопределено Тогда
        OverlayPiece(Snapshot, State.CurrentPiece, State.CurrentPiece.Color);
    КонецЕсли;

    Возврат Snapshot;
КонецФункции

Функция CalculateLineScore(LinesCleared, Level) Экспорт
    Если LinesCleared <= 0 Тогда
        Возврат 0;
    КонецЕсли;

    ScoreTable = Новый Массив;
    ScoreTable.Добавить(40);
    ScoreTable.Добавить(100);
    ScoreTable.Добавить(300);
    ScoreTable.Добавить(1200);

    Index = LinesCleared - 1;
    Если Index >= ScoreTable.Количество() Тогда
        Index = ScoreTable.Количество() - 1;
    КонецЕсли;

    Возврат ScoreTable[Index] * Level;
КонецФункции

Функция CalculateLevel(TotalLines) Экспорт
    Возврат Цел(TotalLines / 10) + 1;
КонецФункции

Функция CalculateDropInterval(Level) Экспорт
    Interval = 1000 - (Level - 1) * 75;
    Если Interval < 100 Тогда
        Interval = 100;
    КонецЕсли;
    Возврат Interval;
КонецФункции

Функция GetNextPiecePreview(State) Экспорт
    Возврат CreatePiece(State.NextPieceName, 4);
КонецФункции

Функция SimulatePlacement(Board, Piece, RotationIndex, TargetX, Width, Height) Экспорт
    TestPiece = ClonePiece(Piece);
    TestPiece.Rotation = RotationIndex;
    TestPiece.Matrix = TestPiece.Variants[RotationIndex];
    TestPiece.X = TargetX;
    TestPiece.Y = 0;

    Если Не IsValidPosition(Board, TestPiece) Тогда
        Возврат Неопределено;
    КонецЕсли;

    Пока IsValidPosition(Board, TestPiece, 0, 1) Цикл
        TestPiece.Y = TestPiece.Y + 1;
    КонецЦикла;

    SimulatedBoard = CloneBoard(Board);
    MergePieceIntoBoard(SimulatedBoard, TestPiece);
    ClearResult = ClearCompletedLines(SimulatedBoard, Width, Height);

    Result = Новый Структура;
    Result.Вставить("Board", ClearResult.Board);
    Result.Вставить("LinesCleared", ClearResult.LinesCleared);
    Result.Вставить("Piece", TestPiece);
    Возврат Result;
КонецФункции

Функция NormalizeSeed(Seed) Экспорт
    NumericSeed = 1;
    Если ТипЗнч(Seed) = Тип("Число") Тогда
        NumericSeed = Seed;
    КонецЕсли;
    NumericSeed = Остаток(Цел(Модуль(NumericSeed)), 2147483647);
    Если NumericSeed = 0 Тогда
        NumericSeed = 1;
    КонецЕсли;
    Возврат NumericSeed;
КонецФункции

Функция NextRandom(State) Экспорт
    State.RandomSeed = Остаток(State.RandomSeed * 48271, 2147483647);
    Возврат State.RandomSeed / 2147483647;
КонецФункции

Функция GetPieceNames() Экспорт
    Names = Новый Массив;
    Names.Добавить("I");
    Names.Добавить("J");
    Names.Добавить("L");
    Names.Добавить("O");
    Names.Добавить("S");
    Names.Добавить("T");
    Names.Добавить("Z");
    Возврат Names;
КонецФункции

Функция GetPieceDefinition(PieceName) Экспорт
    Definition = Новый Структура;
    Definition.Вставить("Color", PieceName);
    Variants = Новый Массив;

    Если PieceName = "I" Тогда
        Variants.Добавить(ParseMatrix("....;####;....;...."));
        Variants.Добавить(ParseMatrix("..#.;..#.;..#.;..#."));
        Variants.Добавить(ParseMatrix("....;....;####;...."));
        Variants.Добавить(ParseMatrix(".#..;.#..;.#..;.#.."));
    ИначеЕсли PieceName = "J" Тогда
        Variants.Добавить(ParseMatrix("#...;###.;....;...."));
        Variants.Добавить(ParseMatrix(".##.;.#..;.#..;...."));
        Variants.Добавить(ParseMatrix("....;###.;..#.;...."));
        Variants.Добавить(ParseMatrix(".#..;.#..;##..;...."));
    ИначеЕсли PieceName = "L" Тогда
        Variants.Добавить(ParseMatrix("..#.;###.;....;...."));
        Variants.Добавить(ParseMatrix(".#..;.#..;.##.;...."));
        Variants.Добавить(ParseMatrix("....;###.;#...;...."));
        Variants.Добавить(ParseMatrix("##..;.#..;.#..;...."));
    ИначеЕсли PieceName = "O" Тогда
        Variants.Добавить(ParseMatrix(".##.;.##.;....;...."));
        Variants.Добавить(ParseMatrix(".##.;.##.;....;...."));
        Variants.Добавить(ParseMatrix(".##.;.##.;....;...."));
        Variants.Добавить(ParseMatrix(".##.;.##.;....;...."));
    ИначеЕсли PieceName = "S" Тогда
        Variants.Добавить(ParseMatrix(".##.;##..;....;...."));
        Variants.Добавить(ParseMatrix(".#..;.##.;..#.;...."));
        Variants.Добавить(ParseMatrix("....;.##.;##..;...."));
        Variants.Добавить(ParseMatrix("#...;##..;.#..;...."));
    ИначеЕсли PieceName = "T" Тогда
        Variants.Добавить(ParseMatrix(".#..;###.;....;...."));
        Variants.Добавить(ParseMatrix(".#..;.##.;.#..;...."));
        Variants.Добавить(ParseMatrix("....;###.;.#..;...."));
        Variants.Добавить(ParseMatrix(".#..;##..;.#..;...."));
    ИначеЕсли PieceName = "Z" Тогда
        Variants.Добавить(ParseMatrix("##..;.##.;....;...."));
        Variants.Добавить(ParseMatrix("..#.;.##.;.#..;...."));
        Variants.Добавить(ParseMatrix("....;##..;.##.;...."));
        Variants.Добавить(ParseMatrix(".#..;##..;#...;...."));
    Иначе
        ВызватьИсключение "Unsupported piece: " + PieceName;
    КонецЕсли;

    Definition.Вставить("Variants", Variants);
    Возврат Definition;
КонецФункции

Функция ParseMatrix(Layout) Экспорт
    Matrix = Новый Массив;
    Rows = СтрРазделить(Layout, ";");

    Для Каждого LayoutRow Из Rows Цикл
        MatrixRow = Новый Массив;
        Для ColIndex = 1 По СтрДлина(LayoutRow) Цикл
            Если Сред(LayoutRow, ColIndex, 1) = "#" Тогда
                MatrixRow.Добавить(1);
            Иначе
                MatrixRow.Добавить(0);
            КонецЕсли;
        КонецЦикла;
        Matrix.Добавить(MatrixRow);
    КонецЦикла;

    Возврат Matrix;
КонецФункции

Функция GetPieceWeight(PieceName, AdaptiveWeights) Экспорт
    Если AdaptiveWeights = Неопределено Тогда
        Возврат 1;
    КонецЕсли;

    Weight = 1;
    Если AdaptiveWeights.Свойство(PieceName, Weight) Тогда
        Если Weight < 0.2 Тогда
            Weight = 0.2;
        КонецЕсли;
        Возврат Weight;
    КонецЕсли;

    Возврат 1;
КонецФункции

Процедура OverlayPiece(Board, Piece, FillValue)
    Для RowIndex = 0 По Piece.Matrix.Количество() - 1 Цикл
        Row = Piece.Matrix[RowIndex];
        Для ColIndex = 0 По Row.Количество() - 1 Цикл
            Если Row[ColIndex] = 0 Тогда
                Продолжить;
            КонецЕсли;

            X = Piece.X + ColIndex;
            Y = Piece.Y + RowIndex;
            Если Y >= 0 И Y < Board.Количество() И X >= 0 И X < Board[Y].Количество() И ПустаяСтрока(Board[Y][X]) Тогда
                Board[Y][X] = FillValue;
            КонецЕсли;
        КонецЦикла;
    КонецЦикла;
КонецПроцедуры

Функция CopyRow(Row)
    Clone = Новый Массив;
    Для Каждого CellValue Из Row Цикл
        Clone.Добавить(CellValue);
    КонецЦикла;
    Возврат Clone;
КонецФункции

Функция CreateEmptyRow(Width)
    Row = Новый Массив;
    Для ColIndex = 0 По Width - 1 Цикл
        Row.Добавить("");
    КонецЦикла;
    Возврат Row;
КонецФункции

Функция NewLockResult(LinesCleared, ScoreDelta, GameOver, PieceName = "")
    Result = Новый Структура;
    Result.Вставить("LinesCleared", LinesCleared);
    Result.Вставить("ScoreDelta", ScoreDelta);
    Result.Вставить("GameOver", GameOver);
    Result.Вставить("PieceName", PieceName);
    Возврат Result;
КонецФункции
