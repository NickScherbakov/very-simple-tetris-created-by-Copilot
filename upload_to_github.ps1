param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Tetris game implementation",
    
    [Parameter(Mandatory=$false)]
    [switch]$Private
)

# Проверка наличия Git
try {
    git --version | Out-Null
}
catch {
    Write-Error "Git не установлен. Пожалуйста, установите Git с https://git-scm.com/"
    exit 1
}

# Проверка авторизации GitHub CLI (если установлен)
$ghInstalled = $false
try {
    gh --version | Out-Null
    $ghInstalled = $true
    
    Write-Host "Проверка авторизации в GitHub CLI..."
    $ghAuth = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Необходимо авторизоваться в GitHub CLI"
        gh auth login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Не удалось авторизоваться в GitHub CLI"
            exit 1
        }
    }
    else {
        Write-Host "Авторизация в GitHub CLI успешна"
    }
}
catch {
    Write-Host "GitHub CLI не установлен. Будем использовать только Git."
}

# Текущая директория
$currentDir = Get-Location

Write-Host "Инициализация Git репозитория..."
if (-not (Test-Path -Path ".git")) {
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Не удалось инициализировать Git репозиторий"
        exit 1
    }
}
else {
    Write-Host "Git репозиторий уже инициализирован"
}

Write-Host "Добавление всех файлов в репозиторий..."
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Не удалось добавить файлы"
    exit 1
}

Write-Host "Создание коммита..."
git commit -m "Initial commit"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Возможно, изменений нет или необходимо настроить пользователя Git"
    Write-Host "Настройка пользователя Git..."
    
    $gitEmail = Read-Host "Введите ваш email для Git"
    $gitName = Read-Host "Введите ваше имя для Git"
    
    git config user.email "$gitEmail"
    git config user.name "$gitName"
    
    git commit -m "Initial commit"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Не удалось создать коммит"
        exit 1
    }
}

# Создание репозитория на GitHub
$repoUrl = "https://github.com/$GitHubUsername/$RepoName"

if ($ghInstalled) {
    # Используем GitHub CLI для создания репозитория
    Write-Host "Создание репозитория на GitHub с помощью GitHub CLI..."
    
    $privateFlag = if ($Private) { "--private" } else { "--public" }
    gh repo create "$GitHubUsername/$RepoName" $privateFlag --description "$Description" --source=. --remote=origin --push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Репозиторий успешно создан и код отправлен на GitHub: $repoUrl"
        exit 0
    }
    else {
        Write-Host "Не удалось создать репозиторий через GitHub CLI, пробуем с помощью Git..."
    }
}

# Если GitHub CLI не установлен или создание через CLI не удалось, пробуем с помощью Git
Write-Host "Создание связи с удаленным репозиторием..."
git remote remove origin 2>$null
git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Не удалось добавить удаленный репозиторий"
    Write-Host "Убедитесь, что вы создали репозиторий '$RepoName' на GitHub: https://github.com/new"
    exit 1
}

Write-Host "Отправка кода на GitHub..."
git push -u origin master
if ($LASTEXITCODE -ne 0) {
    # Попробуем использовать main вместо master
    git push -u origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Не удалось отправить код на GitHub"
        Write-Host "Возможно, вам нужно сначала создать репозиторий на GitHub: https://github.com/new"
        exit 1
    }
}

Write-Host "Проект успешно отправлен на GitHub: $repoUrl"