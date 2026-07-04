#!/usr/bin/env bash
# Pull ops-team-specified Drive folders (Physical AI landing) via rclone.
# Requires `gdrive:` remote configured in ~/.config/rclone/rclone.conf.
# Output tree: /data/tbrain/incoming/drive_ops/{slot}/
#
# Usage: bash scripts/pull-ops-content.sh [--dry-run] [--slot=<name>]

set -euo pipefail

DRY_RUN=""
ONLY_SLOT=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="--dry-run" ;;
    --slot=*)  ONLY_SLOT="${arg#--slot=}" ;;
    *) echo "unknown arg: $arg"; exit 2 ;;
  esac
done

DEST_ROOT="/data/tbrain/incoming/drive_ops"
mkdir -p "$DEST_ROOT"

# Verify remote exists.
if ! rclone listremotes 2>/dev/null | grep -q "^gdrive:$"; then
  echo "ERROR: rclone remote 'gdrive:' not configured. Run: rclone config" >&2
  exit 1
fi

# slot | drive_id | kind (folder|file)
SLOTS=(
  "hero-1        | 1smNRruQ-xk4TcORiHxxx2N6a92nPCE9G                | file"
  "hero-2        | 1m1c-a9qT3Pg4gAVJP3p7ZoLM1z_xJ8iK                | folder"
  "hero-3        | 1xJoEkuBtkhfoInXAda7DMyx3PAoHExeS                | folder"
  "textile-a     | 15kPWVnbXDSCNFsHUYMZ8qn89K1LdmU6z                | folder"
  "textile-b     | 1jOnuCMWppYZntk44Vl4G_Qa602ol9Tmq                | folder"
  "sorting       | 1yZjuYJ6gEYfM4IiaY4KW-A_UexRWI2PI                | folder"
  "warehouse     | 1WJDPp57kuuOhOiic6UFVYKpG_cgc3SnV                | folder"
  "dexterous     | 1EjGOyvKmv7IJi0IJ4MAYYKDF3101vibD                | folder"
  "mocap         | 1sXQEkgQydWRPeWGRTL2to_NtsGGIgoOn                | file"
  "annotation    | 1Wbs8bdQFzD12lsng8axi3YyTqL-eyjxw                | folder"
)

for row in "${SLOTS[@]}"; do
  slot=$(echo "$row" | awk -F'|' '{gsub(/ /,"",$1); print $1}')
  drive_id=$(echo "$row" | awk -F'|' '{gsub(/ /,"",$2); print $2}')
  kind=$(echo "$row" | awk -F'|' '{gsub(/ /,"",$3); print $3}')

  if [[ -n "$ONLY_SLOT" && "$ONLY_SLOT" != "$slot" ]]; then continue; fi

  dest="$DEST_ROOT/$slot"
  mkdir -p "$dest"
  echo "== pull $slot ($kind) → $dest =="

  if [[ "$kind" == "folder" ]]; then
    rclone copy "gdrive:" "$dest/" \
      --drive-root-folder-id "$drive_id" \
      --drive-shared-with-me --transfers=4 --checkers=8 -P $DRY_RUN || \
      echo "WARN: rclone copy folder $slot failed"
  else
    # For a file: list root-folder-id (yields 1 file), then copy by name.
    fname=$(rclone lsf "gdrive:" --drive-root-folder-id "$drive_id" --drive-shared-with-me 2>/dev/null | head -1)
    if [[ -z "$fname" ]]; then
      echo "WARN: file $slot ($drive_id) not accessible"
      continue
    fi
    rclone copyto "gdrive:$fname" "$dest/$slot${fname##*.}" \
      --drive-root-folder-id "$drive_id" \
      --drive-shared-with-me -P $DRY_RUN || \
      echo "WARN: rclone copyto file $slot failed"
  fi
done

echo "== done =="
ls -la "$DEST_ROOT"
