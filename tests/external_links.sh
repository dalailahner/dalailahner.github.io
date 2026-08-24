#!/usr/bin/env bash

# VARIABLES

FILE="index.html"

IGNORE_LIST=(
    "https://example1.com"
    "http://example2.com"
)

HAS_ERRORS=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'


# CHECKS

if [[ ! -f "$FILE" ]]; then
    echo -e "${RED}Error: File '$FILE' not found.${NC}"
    exit 1
fi

if ! command -v curl_chrome150 >/dev/null 2>&1; then
    printf "%bWARNING: no curl_impersonate command found. Skipping...%b\n" "$YELLOW" "$NC"
    exit 0
fi

# check internet connection on cloudflare
if ! curl -s --head --request GET https://1.1.1.1 > /dev/null; then
    printf "%bWARNING: No internet connection detected.%b\n" "$YELLOW" "$NC"
    echo "Skipping external link check for $FILE to prevent false pre-commit failures."
    exit 0
fi


# GET LINKS

if command -v rg >/dev/null 2>&1; then
    URLS=$(rg -o '(href|src)="https?://[^"]+"' "$FILE" | cut -d'"' -f2 | sort -u)
else
    URLS=$(grep -E -o '(href|src)="https?://[^"]+"' "$FILE" | cut -d'"' -f2 | sort -u)
fi

if [[ -z "$URLS" ]]; then
    echo "No external links found in $FILE. Skipping..."
    exit 0
fi


# TEST LINKS

is_ignored() {
    local target="$1"
    for ignored in "${IGNORE_LIST[@]}"; do
        if [[ "$ignored" == "$target" ]]; then
            return 0
        fi
    done
    return 1
}

for URL in $URLS; do
    if is_ignored "$URL"; then
        echo "[IGNORED]   $URL"
        continue
    fi

    RESPONSE=$(curl_chrome150 -sL -w "%{http_code} %{num_redirects} %{url_effective}" -o /dev/null "$URL")

    HTTP_CODE=$(echo "$RESPONSE" | awk '{print $1}')
    REDIRECTS=$(echo "$RESPONSE" | awk '{print $2}')
    FINAL_URL=$(echo "$RESPONSE" | awk '{print $3}')

    if [[ "$HTTP_CODE" == "000" ]]; then
        printf "%b[ERROR]%b     %s -> Failed to reach host (000)\n" "$RED" "$NC" "$URL"
        HAS_ERRORS=1
    elif [[ "$HTTP_CODE" -ge 400 ]]; then
        printf "%b[ERROR]%b     %s -> HTTP %s\n" "$RED" "$NC" "$URL" "$HTTP_CODE"
        HAS_ERRORS=1
    else
        if [[ "$REDIRECTS" -gt 0 ]]; then
            printf "%b[REDIRECT]%b  %s -> %s (HTTP %s)\n" "$YELLOW" "$NC" "$URL" "$FINAL_URL" "$HTTP_CODE"
        else
            printf "%b[OK]%b        %s (HTTP %s)\n" "$GREEN" "$NC" "$URL" "$HTTP_CODE"
        fi
    fi
done

if [[ $HAS_ERRORS -eq 1 ]]; then
    printf "%bERROR: One or more links are broken.%b\n" "$RED" "$NC"
    exit 1
else
    exit 0
fi
