#!/usr/bin/env bash
# Re-apply execute bits after clone, unzip, or cloud sync (often drops +x).
# Usage: bash .cursor/hooks/ensure-permissions.sh
set -euo pipefail
chmod +x "$(dirname "$0")"/*.sh
echo "OK: .cursor/hooks/*.sh are executable"
