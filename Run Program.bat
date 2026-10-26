start "Frontend" cmd /k "cd /d "%~dp0frontend" && call runFrontend.bat"

:: start backend window in backend
start "Backend" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate && python3 main.py"