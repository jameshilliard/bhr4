rmdir /s /q output
pause

rmdir /S /Q output
mkdir output
mkdir output\css
mkdir output\img_wh
mkdir output\js
mkdir output\partials
mkdir output\lib
pause

java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js js/advancedControllers.js js/firewallControllers.js js/firewallUtil.js js/igmpControllers.js js/mainControllers.js js/networkControllers.js js/parentalControllers.js js/systemControllers.js js/util.js js/wirelessControllers.js --js_output_file output/js/ui.min.js
pause

copy js\app.js output\js\
copy js\filters.js output\js\
copy js\directives.js output\js\
copy js\rest.js output\js\
copy js\services.js output\js\
copy js\sha512.js output\js\
copy js\moment.min.js output\js\
copy js\moment-timezone.min.js output\js\
copy js\redirectControllers.js output\js\
copy js\redirectApp.js output\js\
copy redirect.html output\
copy js\redirectSetupControllers.js output\js\
copy js\redirectSetupApp.js output\js\
copy redirectSetup.html output\
ROBOCOPY lib\angular\ output\js\ /E
ROBOCOPY img_wh\ output\img_wh\ /E
ROBOCOPY css\ output\css\ /E
ROBOCOPY partials\ output\partials\ /E
move output\partials\index-min.html output\index.html

pause

version.sh
pause