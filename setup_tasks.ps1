$TaskName1 = "FitGirlScraper_Startup"
$TaskName2 = "FitGirlScraper_Interval"
$ScriptPath = "C:\Users\Paul\Desktop\Mods\FGR\manager.py"
$PythonExe = "python" # Assuming python is in PATH

# 1. Task on Startup (Updates)
$Action1 = New-ScheduledTaskAction -Execute $PythonExe -Argument "$ScriptPath 3"
$Trigger1 = New-ScheduledTaskTrigger -AtStartup
$Settings1 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName $TaskName1 -Action $Action1 -Trigger $Trigger1 -Settings $Settings1 -Description "FitGirl Scraper Auto Update on Startup" -Force

# 2. Task Every 3 Hours (Updates)
$Action2 = New-ScheduledTaskAction -Execute $PythonExe -Argument "$ScriptPath 3"
$Trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 3)
$Settings2 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName $TaskName2 -Action $Action2 -Trigger $Trigger2 -Settings $Settings2 -Description "FitGirl Scraper Auto Update Every 3 Hours" -Force

Write-Host "Scheduled tasks created successfully."
Write-Host "Task 1: $TaskName1 (Runs on system startup)"
Write-Host "Task 2: $TaskName2 (Runs every 3 hours)"
