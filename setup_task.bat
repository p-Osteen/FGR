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

powershell -Command "Unregister-ScheduledTask -TaskName 'FGR_Update_Scraper' -Confirm:$false -ErrorAction SilentlyContinue; $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c run_task.bat' -WorkingDirectory (Get-Item '%~dp0.').FullName; $trigger = New-ScheduledTaskTrigger -AtLogOn; $dummy = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 3); $trigger.Repetition = $dummy.Repetition; $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable; Register-ScheduledTask -TaskName 'FGR_Update_Scraper' -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null; Start-ScheduledTask -TaskName 'FGR_Update_Scraper'; Write-Host 'Task FGR_Update_Scraper successfully created and started!'"

echo.
pause
