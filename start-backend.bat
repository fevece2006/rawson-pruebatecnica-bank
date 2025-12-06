@echo off
echo ================================================
echo   Rawson Bank System - Inicio Rapido
echo ================================================
echo.

echo [1/3] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta en el PATH
    echo Por favor instala Docker Desktop y vuelve a intentarlo
    pause
    exit /b 1
)
echo Docker encontrado!
echo.

echo [2/3] Verificando que Docker Desktop este corriendo...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop no esta corriendo
    echo Por favor inicia Docker Desktop y vuelve a ejecutar este script
    pause
    exit /b 1
)
echo Docker Desktop esta corriendo!
echo.

echo [3/3] Levantando todos los servicios backend...
echo Esto puede tardar varios minutos en la primera ejecucion...
echo.
docker-compose up --build

echo.
echo ================================================
echo   Servicios detenidos
echo ================================================
pause
