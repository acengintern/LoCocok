// .\start-dev.bat in terminal when u wanna run


@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -Path '%~dp0frontend\.next\dev\lock' -Force -ErrorAction SilentlyContinue; $backend = Start-Process php -ArgumentList 'artisan','serve','--port=8000' -WorkingDirectory '%~dp0backend' -NoNewWindow -PassThru; Write-Host '=====================================================' -ForegroundColor Cyan; Write-Host '  LOCO TRACK (Backend + Frontend) - Antigravity      ' -ForegroundColor Cyan; Write-Host '=====================================================' -ForegroundColor Cyan; Write-Host '? Backend API : http://localhost:8000' -ForegroundColor Green; Write-Host '? Frontend App: http://localhost:3000' -ForegroundColor Green; Write-Host '-----------------------------------------------------' -ForegroundColor Cyan; try { Set-Location '%~dp0frontend'; npm run dev } finally { if ($backend) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue } }"
