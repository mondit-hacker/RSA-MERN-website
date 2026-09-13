@echo off
title Rise & Shine Academy ERP
color 1F
echo  Rise ^& Shine Academy ERP — Starting...
start "RSA Backend"  cmd /k "cd /d %~dp0rsa-backend  && npm run dev"
timeout /t 5 /nobreak > nul
start "RSA Frontend" cmd /k "cd /d %~dp0rsa-frontend && npm run dev"
timeout /t 8 /nobreak > nul
start http://localhost:3000
