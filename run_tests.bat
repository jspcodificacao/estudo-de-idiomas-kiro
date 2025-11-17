@echo off
REM Script para executar os testes da API do backend

echo ========================================
echo   TESTES DA API - BACKEND
echo ========================================
echo.

REM Verificar se pytest está instalado
python -c "import pytest" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] pytest nao esta instalado!
    echo Execute: pip install -r backend/requirements.txt
    echo.
    pause
    exit /b 1
)

REM Executar testes
echo Executando testes...
echo.
pytest backend/test_api.py -v

REM Verificar resultado
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   TODOS OS TESTES PASSARAM!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ALGUNS TESTES FALHARAM!
    echo ========================================
    exit /b 1
)

echo.
pause
