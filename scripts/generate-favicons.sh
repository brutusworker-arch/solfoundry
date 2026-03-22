#!/usr/bin/env bash
# generate-favicons.sh — Generates PNG favicons from assets/logo-icon.svg
# Requires: inkscape OR rsvg-convert OR ImageMagick (convert) with librsvg delegate
#
# Usage:  bash scripts/generate-favicons.sh
# Output: frontend/public/favicon-{16x16,32x32,180x180,192x192,512x512}.png
#          frontend/public/apple-touch-icon.png
#          frontend/public/favicon.ico   (multi-res: 16+32+48)

set -euo pipefail

SRC="assets/logo-icon.svg"
OUT="frontend/public"

mkdir -p "$OUT"

# Sizes to generate
declare -A SIZES=(
  ["favicon-16x16.png"]=16
  ["favicon-32x32.png"]=32
  ["favicon-180x180.png"]=180
  ["apple-touch-icon.png"]=180
  ["favicon-192x192.png"]=192
  ["favicon-512x512.png"]=512
)

# Detect available converter
if command -v inkscape &>/dev/null; then
  CONVERTER="inkscape"
elif command -v rsvg-convert &>/dev/null; then
  CONVERTER="rsvg"
elif command -v convert &>/dev/null; then
  CONVERTER="imagemagick"
else
  echo "ERROR: No SVG→PNG converter found. Install inkscape, librsvg2-bin, or imagemagick." >&2
  exit 1
fi

echo "Using converter: $CONVERTER"

convert_svg() {
  local size=$1 dest=$2
  case "$CONVERTER" in
    inkscape)
      inkscape --export-type=png --export-width="$size" --export-height="$size" \
               --export-filename="$dest" "$SRC" 2>/dev/null
      ;;
    rsvg)
      rsvg-convert -w "$size" -h "$size" -o "$dest" "$SRC"
      ;;
    imagemagick)
      convert -background none -resize "${size}x${size}" "$SRC" "$dest"
      ;;
  esac
}

for filename in "${!SIZES[@]}"; do
  size="${SIZES[$filename]}"
  dest="$OUT/$filename"
  echo "  Generating $dest (${size}x${size})..."
  convert_svg "$size" "$dest"
done

# Generate multi-resolution .ico (16, 32, 48)
echo "  Generating $OUT/favicon.ico (16+32+48)..."
tmp16=$(mktemp /tmp/fav16.XXXXXX.png)
tmp32=$(mktemp /tmp/fav32.XXXXXX.png)
tmp48=$(mktemp /tmp/fav48.XXXXXX.png)

convert_svg 16 "$tmp16"
convert_svg 32 "$tmp32"
convert_svg 48 "$tmp48"

case "$CONVERTER" in
  inkscape|imagemagick)
    convert "$tmp16" "$tmp32" "$tmp48" "$OUT/favicon.ico"
    ;;
  rsvg)
    # rsvg-convert doesn't produce .ico; fall back to imagemagick if available
    if command -v convert &>/dev/null; then
      convert "$tmp16" "$tmp32" "$tmp48" "$OUT/favicon.ico"
    else
      echo "  WARNING: cannot produce favicon.ico without imagemagick. Skipping."
    fi
    ;;
esac

rm -f "$tmp16" "$tmp32" "$tmp48"

echo "Done. Favicons written to $OUT/"
