@echo off
echo ================================================
echo   Deteniendo todos los servicios...
echo ================================================
echo.

docker-compose down

echo.
echo Servicios detenidos exitosamente!
echo.
echo Para eliminar tambien los volumenes (base de datos), ejecuta:
echo   docker-compose down -v
echo.
pause
