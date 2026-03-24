#!/bin/bash
# Re-encode audio files to 64kbps mono using xargs for parallel processing

DIR="/Users/govar/Downloads/uploads-optimized"
JOBS=70

optimize_file() {
    file="$1"
    tmp="${file}.tmp.mp3"
    orig_size=$(stat -f%z "$file" 2>/dev/null)

    if ffmpeg -i "$file" -codec:a libmp3lame -b:a 64k -ac 1 -y "$tmp" -loglevel error 2>/dev/null; then
        new_size=$(stat -f%z "$tmp" 2>/dev/null)
        if [ "$new_size" -lt "$orig_size" ] 2>/dev/null; then
            if [[ "$file" == *.m4a ]] || [[ "$file" == *.000 ]]; then
                mv "$tmp" "${file%.*}.mp3"
                rm -f "$file"
            else
                mv "$tmp" "$file"
            fi
            echo "OK $(basename "$file")"
        else
            rm -f "$tmp"
            echo "SKIP $(basename "$file")"
        fi
    else
        rm -f "$tmp"
        echo "ERR $(basename "$file")"
    fi
}

export -f optimize_file

TOTAL=$(find "$DIR" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -name '*.000' \) | wc -l | tr -d ' ')
echo "Optimizing $TOTAL audio files with $JOBS parallel jobs..."

find "$DIR" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -name '*.000' \) -print0 | \
    xargs -0 -P "$JOBS" -I {} bash -c 'optimize_file "$@"' _ {}

echo ""
echo "Done!"
du -sh "$DIR"
