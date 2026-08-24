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
  printf "\033[0;33mWARNING:\033[0m found non .avif files in memes folder:\n"
  for nonAvifFile in "${nonAvifArr[@]}"; do
    echo "$nonAvifFile"
  done
    printf "\n"
fi

if [[ "$totalFiles" == "$configMemes" ]]; then
  exit 0
else
  printf "\033[0;31mERROR: found %s in memes folder, but only %s in config\033[0m\n" "$totalFiles" "$configMemes"
  exit 1
fi