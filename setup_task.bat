@echo off
:: Check for Admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo Administrative privileges confirmed.
echo Setting up FGR_Update_Scraper scheduled task...

powershell -Command "Unregister-ScheduledTask -TaskName 'FGR_Update_Scraper' -Confirm:$false -ErrorAction SilentlyContinue; $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c \"python manager.py 3 && python manager.py 4\"' -WorkingDirectory '%~dp0.'; $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 3); Register-ScheduledTask -TaskName 'FGR_Update_Scraper' -Action $action -Trigger $trigger | Out-Null; Write-Host 'Task FGR_Update_Scraper successfully (re)created!'"

echo.
pause
