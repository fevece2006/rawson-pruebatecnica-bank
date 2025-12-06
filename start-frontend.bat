@echo off
echo ================================================
echo   Rawson Bank System - Frontend
echo ================================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js 18+ y vuelve a intentarlo
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

echo Navegando al directorio del frontend...
cd frontend-bank-system
if errorlevel 1 (
    echo ERROR: No se pudo encontrar el directorio frontend-bank-system
    pause
    exit /b 1
)

echo.
echo Verificando si node_modules existe...
if not exist "node_modules" (
    echo node_modules no encontrado. Instalando dependencias...
    echo.
    npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
) else (
    echo Dependencias ya instaladas!
)

echo.
echo Iniciando el servidor de desarrollo...
echo El frontend estara disponible en http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev

pause
