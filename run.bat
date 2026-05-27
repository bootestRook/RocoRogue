@echo off
setlocal EnableDelayedExpansion

set "ROOT=%~dp0"
set "SITE=%ROOT%rocorogue-public"
set "PORT=4173"
set "PORT_FILE=%ROOT%.rocorogue-port"
set "SERVER_JS=%ROOT%rocorogue-server.js"
set "INDEX_FILE=%SITE%\index.html"

if not exist "%SITE%\index.html" (
  echo [ERROR] Cannot find rocorogue-public\index.html.
  echo Expected mirror at: "%SITE%"
  pause
  exit /b 1
)

if exist "%PORT_FILE%" (
  set /p PORT=<"%PORT_FILE%"
  call :server_matches_site
  if not errorlevel 1 (
    echo RocoRogue mirror is already running on port !PORT!.
    call :open_page
    exit /b 0
  )
)

call :find_free_port
if errorlevel 1 (
  echo [ERROR] Cannot find an available local port from 4173 to 4190.
  pause
  exit /b 1
)

call :find_server
if errorlevel 1 (
  echo [ERROR] Cannot start local server.
  echo Python 3 is not available and Node.js was not found.
  echo Install Python 3 or Node.js, then run this file again.
  pause
  exit /b 1
)

if exist "%PORT_FILE%" del "%PORT_FILE%" >nul 2>nul
echo %PORT%>"%PORT_FILE%"

if /i "%SERVER_KIND%"=="python" (
  echo [WARN] Node.js was not found. Python fallback may cache files in the browser.
)

if /i "%SERVER_KIND%"=="node" (
  goto start_server
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
  if not errorlevel 1 (
    echo Port %PORT% is already in use.
    call :open_page
    exit /b 0
  )
)

:start_server
cd /d "%SITE%"
echo Starting one-to-one RocoRogue public mirror...
echo Serving: "%SITE%"
echo Runtime: %SERVER_RUNTIME%

if /i "%SERVER_KIND%"=="node" (
  start "RocoRogue Server" /min cmd /c call node "%SERVER_JS%" "%SITE%" %PORT%
) else (
  start "RocoRogue Server" /min cmd /c call %SERVER_RUNTIME% -m http.server %PORT% --bind 127.0.0.1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(8); while((Get-Date) -lt $deadline) { try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; Start-Sleep -Milliseconds 250 }; exit 1" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Server did not start on port %PORT%.
  pause
  exit /b 1
)

call :open_page
exit /b 0

:server_matches_site
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $local=Get-Content -Raw -LiteralPath '%INDEX_FILE%'; $mark=[regex]::Match($local, 'pet-box-view\.js\?v=([^\x22&?#]+)').Groups[1].Value; $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:%PORT%/' -TimeoutSec 1; if ($mark -and $r.StatusCode -eq 200 -and $r.Content -match [regex]::Escape($mark)) { exit 0 } } catch {}; exit 1" >nul 2>nul
exit /b %errorlevel%

:find_free_port
set "PORT="
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($p = 4173; $p -le 4190; $p++) { if (-not (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)) { Write-Output $p; exit 0 } }; exit 1"') do set "PORT=%%P"
if not defined PORT exit /b 1
exit /b 0

:open_page
set "URL=http://127.0.0.1:%PORT%/?v=20260528-assets-1#/mechanics?view=pet-box"
echo Opening: %URL%
start "" "%URL%"
exit /b 0

:find_server
if exist "%SERVER_JS%" (
  where node >nul 2>nul
  if not errorlevel 1 (
    node -e "process.exit(0)" >nul 2>nul
    if not errorlevel 1 (
      set "SERVER_KIND=node"
      set "SERVER_RUNTIME=node"
      exit /b 0
    )
  )
)

where python >nul 2>nul
if not errorlevel 1 (
  python -c "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)" >nul 2>nul
  if not errorlevel 1 (
    set "SERVER_KIND=python"
    set "SERVER_RUNTIME=python"
    exit /b 0
  )
)

where python3 >nul 2>nul
if not errorlevel 1 (
  python3 -c "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)" >nul 2>nul
  if not errorlevel 1 (
    set "SERVER_KIND=python"
    set "SERVER_RUNTIME=python3"
    exit /b 0
  )
)

where py >nul 2>nul
if not errorlevel 1 (
  py -3 -c "import sys; raise SystemExit(0 if sys.version_info[0] == 3 else 1)" >nul 2>nul
  if not errorlevel 1 (
    set "SERVER_KIND=python"
    set "SERVER_RUNTIME=py -3"
    exit /b 0
  )
)

exit /b 1
