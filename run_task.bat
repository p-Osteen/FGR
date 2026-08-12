@echo off
echo ========================================== > update_task.log
echo Start Time: %date% %time% >> update_task.log
echo Running Incremental Update... >> update_task.log
python manager.py 3 >> update_task.log 2>&1
echo Pushing to Live... >> update_task.log
python manager.py 4 >> update_task.log 2>&1
echo Finished at %time%! >> update_task.log
