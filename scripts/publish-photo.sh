#!/bin/zsh
set -e

# Resolve repository root from script location
SCRIPT_DIR="${0:A:h}"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
PHOTO_DIR="src/assets/mo"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

notify() {
  /usr/bin/osascript -e \
    "display notification \"$1\" with title \"Movember Publisher\""
}

fail() {
  notify "$1"
  echo "Error: $1" >&2
  exit 1
}

# Accept a photo path and optional day of month
[[ $# -ge 1 && $# -le 2 ]] ||
  fail "Usage: publish-photo.sh <photo> [day]"

SOURCE="$1"
DAY="${2:-$(date +%-d)}"

[[ -f "$SOURCE" ]] || fail "File not found."

# Case-insensitive JPEG extension validation
case "${SOURCE:l}" in
  *.jpg|*.jpeg) ;;
  *) fail "Please select a JPEG image." ;;
esac

# Validate day: 1–30, with optional leading zero
if ! [[ "$DAY" =~ '^(0?[1-9]|[12][0-9]|30)$' ]]; then
  fail "Day must be between 1 and 30."
fi

# Normalize leading zero
DAY=$(( ${DAY#0} ))

FILENAME=$(printf "day-%02d.jpg" "$((10#$DAY))")
DEST="$REPO/$PHOTO_DIR/$FILENAME"

[[ -d "$REPO/.git" ]] || fail "Repository not found."
[[ -d "$REPO/$PHOTO_DIR" ]] || fail "Photo folder not found."

cd "$REPO"

BRANCH=$(git branch --show-current)
[[ "$BRANCH" == "main" ]] || fail "Not on main branch."

git pull --ff-only || fail "Git pull failed."

[[ ! -e "$DEST" ]] || fail "$FILENAME already exists."

# Copy and rename to lowercase .jpeg
cp "$SOURCE" "$DEST"

git add -- "$PHOTO_DIR/$FILENAME"
git commit -m "Add Movember photo for day $DAY" ||
  fail "Git commit failed."

git push || fail "Git push failed."

notify "Day $DAY photo published successfully!"
