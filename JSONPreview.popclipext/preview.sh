#!/bin/sh
set -eu
package_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
preview_dir=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp/}popclip-json-preview.XXXXXXXX")
preview_file="$preview_dir/JSON-Preview.html"
# No before/after clipboard actions; selection remains data, never shell code.
if ! /usr/bin/osascript -l JavaScript "$package_dir/render.js" "$package_dir/preview.html" > "$preview_file"; then
  /bin/rm -rf -- "$preview_dir"
  exit 1
fi
/bin/chmod 600 "$preview_file"
/usr/bin/open "$preview_file"
