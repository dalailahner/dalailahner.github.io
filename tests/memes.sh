#!/usr/bin/env bash

totalFiles=0
nonAvifArr=()
configMemes=$(jq -r '.memes' ./src/scripts/config.json)

for meme in ./static/memes/*; do
  if [[ -f "$meme" ]]; then

    ((totalFiles++))

    if [[ "$meme" != *.avif ]]; then
      nonAvifArr+=("$meme")
    fi
  fi
done

if (( ${#nonAvifArr[@]} > 0 )); then
  echo -e "\e[33mWARNING:\e[0m found non .avif files in memes folder:"
  for nonAvifFile in "${nonAvifArr[@]}"; do
    echo "$nonAvifFile"
  done
    printf "\n"
fi

if [[ "$totalFiles" == "$configMemes" ]]; then
  exit 0
else
  echo -e "\e[31mERROR: found $totalFiles in memes folder, but only $configMemes in config\e[0m\n"
  exit 1
fi