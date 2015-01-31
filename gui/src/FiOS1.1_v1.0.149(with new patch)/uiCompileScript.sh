#!/bin/sh

rm -rf output/
mkdir output/
mkdir output/css/
mkdir output/img_wh/
mkdir output/js/
mkdir output/partials/
mkdir output/lib/

java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js js/advancedControllers.js js/firewallControllers.js js/firewallUtil.js js/igmpControllers.js js/mainControllers.js js/networkControllers.js js/parentalControllers.js js/systemControllers.js js/util.js js/wirelessControllers.js --js_output_file output/js/ui.min.js

cp js/app.js output/js/
cp js/filters.js output/js/
cp js/directives.js output/js/
cp js/rest.js output/js/
cp js/services.js output/js/
cp js/sha512.js output/js/
cp js/moment.min.js output/js/
cp js/moment-timezone.min.js output/js/
cp js/redirectControllers.js output/js/
cp js/redirectApp.js output/js/
cp redirect.html output/
cp js/redirectSetupControllers.js output/js/
cp js/redirectSetupApp.js output/js/
cp redirectSetup.html output/
cp lib/angular/* output/js/
cp -r img_wh/* output/img_wh/
cp -r css/* output/css/
cp -r partials/* output/partials/
mv output/partials/index-min.html output/index.html

./version.sh
