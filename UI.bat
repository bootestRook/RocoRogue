@echo off
setlocal EnableDelayedExpansion

set "ROOT=%~dp0"
set "SITE=%ROOT%rocorogue-public"
set "PORT=4174"
set "START_PORT=4174"
set "END_PORT=4191"
set "PORT_FILE=%ROOT%.rocorogue-ui-port"
set "SERVER_JS=%ROOT%rocorogue-server.js"
set "ROCO_UI_TUNER=1"
set "VITE_ROCO_UI_TUNER=1"

if not exist "%SITE%\index.html" (
  echo [ERROR] Cannot find rocorogue-public\index.html.
  echo Expected mirror at: "%SITE%"
  pause
  exit /b 1
)

if not exist "%SERVER_JS%" (
  echo [ERROR] Cannot find rocorogue-server.js.
  echo UI tuning mode requires the local Node.js server.
  pause
  exit /b 1
)

if exist "%PORT_FILE%" (
  set /p PORT=<"%PORT_FILE%"
  call :server_matches_site
  if not errorlevel 1 (
    echo RocoRogue UI tuner is already running on port !PORT!.
    call :open_page
    exit /b 0
  )
)

call :find_free_port
if errorlevel 1 (
  echo [ERROR] Cannot find an available local UI tuning port from %START_PORT% to %END_PORT%.
  pause
  exit /b 1
)

call :find_server
if errorlevel 1 (
  echo [ERROR] Cannot start UI tuning server.
  echo Node.js is required because UI tuning mode injects the overlay and writes ui-tuning\latest.layout.json.
  pause
  exit /b 1
)

if exist "%PORT_FILE%" del "%PORT_FILE%" >nul 2>nul
echo %PORT%>"%PORT_FILE%"

cd /d "%SITE%"
echo Starting RocoRogue UI tuning mirror...
echo Serving: "%SITE%"
echo Runtime: %SERVER_RUNTIME%
echo UI tuning: ROCO_UI_TUNER=%ROCO_UI_TUNER%

start "RocoRogue UI Tuner" /min cmd /c call node "%SERVER_JS%" "%SITE%" %PORT%

powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(8); while((Get-Date) -lt $deadline) { try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/__ui_tuner/health' -TimeoutSec 1; if ($r.StatusCode -eq 200 -and $r.Content -match 'ui-tuner') { exit 0 } } catch {}; Start-Sleep -Milliseconds 250 }; exit 1" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] UI tuning server did not start on port %PORT%.
  pause
  exit /b 1
)

call :open_page
exit /b 0

:server_matches_site
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/__ui_tuner/health' -TimeoutSec 1; if ($r.StatusCode -eq 200 -and $r.Content -match 'ui-tuner') { exit 0 } } catch {}; exit 1" >nul 2>nul
exit /b %errorlevel%

:find_free_port
set "PORT="
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($p = %START_PORT%; $p -le %END_PORT%; $p++) { if (-not (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)) { Write-Output $p; exit 0 } }; exit 1"') do set "PORT=%%P"
if not defined PORT exit /b 1
exit /b 0

:open_page
set "URL=http://127.0.0.1:%PORT%/?uiTune=1^&v=%RANDOM%#/mechanics?view=pet-box"
echo Opening: %URL%
start "" "%URL%"
exit /b 0

:find_server
where node >nul 2>nul
if errorlevel 1 exit /b 1

node -e "process.exit(0)" >nul 2>nul
if errorlevel 1 exit /b 1

set "SERVER_RUNTIME=node"
exit /b 0
