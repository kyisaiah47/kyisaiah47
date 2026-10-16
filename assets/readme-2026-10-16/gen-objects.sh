#!/bin/zsh
# Generate one Codex object per slug: built-in image generation on plain white, then a corner
# flood fill to real alpha. Usage: gen-objects.sh slug [slug...]   (run 4 at a time with xargs -P 4)
set -u
D=${0:A:h}
PY=$HOME/.venvs/bg-remove/bin/python
for slug in "$@"; do
  raw=$D/raw/$slug.png
  rm -f "$raw"
  base=$(sed 's#^Scene/backdrop:.*#Scene/backdrop: plain flat solid pure white \#FFFFFF background filling the entire canvas edge to edge; no floor, ground plane, base plate, contact shadow, cast shadow or white patch under the object, no environment, frame, checkerboard, lattice, or typography; the object stands directly on the white with nothing beneath it#' "$D/prompts/_base.txt")
  prompt="Use your built-in image generation tool to make exactly one image from the brief below. Do not write code to draw it, do not use any API, CLI or other model. Landscape 1536x1024. The background must be plain flat solid white with nothing on it. After it is generated, copy the generated PNG file to exactly this path: $raw . Do nothing else. Reply with the path.

$(cat "$D/prompts/$slug.txt")
$base"
  ~/.codex/bin/codex-p -p "$prompt" > "$D/raw/$slug.log" 2>&1
  if [ -f "$raw" ]; then
    $PY "$D/cutout-white.py" "$raw" "$D/objects/$slug.png" >> "$D/raw/$slug.log" 2>&1 && echo "$slug ok" || echo "$slug CUT-FAIL"
  else
    echo "$slug NO-IMAGE"
  fi
done
