@echo off
cd /d "%~dp0"
node build.mjs
if errorlevel 1 goto error
node preview.mjs
goto end
:error
echo Verifique se o Node.js 24 esta instalado.
pause
:end
