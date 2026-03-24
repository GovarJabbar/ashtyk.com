#!/bin/bash
# Re-encode MP3/M4A files to 64kbps mono for speech content
# Processes files in-place in uploads-optimized/

DIR="/Users/govar/Downloads/uploads-optimized"
TOTAL=0
DONE=0
ERRORS=0

# Count total audio files
TOTAL=$(find "$DIR" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -name '*.000' \) | wc -l | tr -d ' ')
echo "Found $TOTAL audio files to optimize"

find "$DIR" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -name '*.000' \) | while read -r file; do
    DONE=$((DONE + 1))

    # Get original size
    orig_size=$(stat -f%z "$file" 2>/dev/null)

    # Temp file
    tmp="${file}.tmp.mp3"

    # Re-encode to 64kbps mono
    if ffmpeg -i "$file" -codec:a libmp3lame -b:a 64k -ac 1 -y "$tmp" -loglevel error 2>/dev/null; then
        new_size=$(stat -f%z "$tmp" 2>/dev/null)

        # Only replace if smaller
        if [ "$new_size" -lt "$orig_size" ] 2>/dev/null; then
            # If original was m4a or .000, replace with .mp3 extension
            if [[ "$file" == *.m4a ]] || [[ "$file" == *.000 ]]; then
                mv "$tmp" "${file%.*}.mp3"
                rm -f "$file"
            else
                mv "$tmp" "$file"
            fi
            saved=$(( (orig_size - new_size) / 1024 / 1024 ))
            echo "[$DONE/$TOTAL] Optimized: $(basename "$file") (saved ${saved}MB)"
        else
            rm -f "$tmp"
            echo "[$DONE/$TOTAL] Skipped (already small): $(basename "$file")"
        fi
    else
        rm -f "$tmp"
        ERRORS=$((ERRORS + 1))
        echo "[$DONE/$TOTAL] ERROR: $(basename "$file")"
    fi
done

echo ""
echo "Done! Total size after optimization:"
du -sh "$DIR"
