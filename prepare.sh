CACHEBUST=`date +%s`
sed 's/CACHEBUST/'$CACHEBUST'/g' index.html > docs/index.html
cp map.js docs/map.min.js
cp map.css docs/map.min.css
cp option.html docs/option/index.html
#uglifyjs --rename map.js > docs/map.min.js
#uglifycss map.css > docs/map.min.css
