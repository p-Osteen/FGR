@echo off
:: Check for Admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo Administrative privileges confirmed.
echo Checking if FGR_Update_Scraper scheduled task exists...

powershell -Command "if (Get-ScheduledTask -TaskName 'FGR_Update_Scraper' -ErrorAction SilentlyContinue) { Write-Host 'Task already exists. Skipping creation.' } else { $action = New-ScheduledTaskAction -Execute 'python' -Argument 'manager.py 3' -WorkingDirectory '%~dp0.'; $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 3); Register-ScheduledTask -TaskName 'FGR_Update_Scraper' -Action $action -Trigger $trigger | Out-Null; Write-Host 'Task FGR_Update_Scraper successfully created!' }"

echo.
pause
