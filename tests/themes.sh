#!/usr/bin/env bash

if [[ $(jq '[.themes[] | keys] | unique | length == 1' ./src/scripts/config.json) == true ]]; then
  exit 0
else
  echo -e "\e[31mERROR: the keys of the themes in config.json differ from each other\e[0m\n"
  exit 1
fi
