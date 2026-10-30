@echo off
title CCNA 2 v7 Test Server
chcp 65001 >nul
echo Spoustim CCNA 2 v7 Testovaci aplikaci...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0spustit-server.ps1"
pause
