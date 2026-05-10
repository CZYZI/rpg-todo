@echo off
cd /d "%~dp0"
call "%~dp0..\..\..\.workbuddy\binaries\node\versions\22.12.0\npm.cmd" install
call "%~dp0..\..\..\.workbuddy\binaries\node\versions\22.12.0\npm.cmd" run build
pause
