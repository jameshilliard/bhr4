#!/bin/bash

versionNo=v1.0.124
echo $versionNo
find ./output/ -name \*.js -type f -print0 | while read -d $'\0' file; do
    echo "Processing $file"
    sed -i 's/{version_number}/'$versionNo'/g' $file
done
find ./output/ -name \*.htm -type f -print0 | while read -d $'\0' file; do
    echo "Processing $file"
	sed -i 's/{version_number}/'$versionNo'/g' $file
done
find ./output/ -name \*.html -type f -print0 | while read -d $'\0' file; do
    echo "Processing $file"
	sed -i 's/{version_number}/'$versionNo'/g' $file
done
find ./output/ -name \*.css -type f -print0 | while read -d $'\0' file; do
    echo "Processing $file"
	sed -i 's/{version_number}/'$versionNo'/g' $file
done