@echo off
setlocal

set "ROOT=%~dp0"
set "SITE=%ROOT%rocorogue-public"
set "PORT=4173"
set "URL=http://127.0.0.1:%PORT%/?v=%RANDOM%#/team"

if not exist "%SITE%\index.html" (
  echo [ERROR] Cannot find rocorogue-public\index.html.
  echo Expected mirror at: "%SITE%"
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo RocoRogue mirror is already running on port %PORT%.
  echo Opening: %URL%
  start "" "%URL%"
  exit /b 0
)

where python >nul 2>nul
if not errorlevel 1 (
  set "PYTHON=python"
  goto :start_server
)

where py >nul 2>nul
if not errorlevel 1 (
  set "PYTHON=py -3"
  goto :start_server
)

echo [ERROR] Python is not installed or not in PATH.
echo Install Python, then run this file again.
pause
exit /b 1

:start_server
cd /d "%SITE%"
echo Starting one-to-one RocoRogue public mirror...
echo Serving: "%SITE%"
start "RocoRogue Server" /min cmd /c "%PYTHON% -m http.server %PORT% --bind 127.0.0.1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(8); while((Get-Date) -lt $deadline) { try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; Start-Sleep -Milliseconds 250 }; exit 1" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Server did not start on port %PORT%.
  pause
  exit /b 1
)

echo Opening: %URL%
start "" "%URL%"
