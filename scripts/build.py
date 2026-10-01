#!/usr/bin/env python3
"""Validate and reproducibly package the extension without third-party dependencies."""
import json
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
package = root / 'JSONPreview.popclipext'
files = ('Config.json', 'preview.sh', 'render.js', 'preview.html')
config = json.loads((package / 'Config.json').read_text())
for item in [config, *config['actions']]:
    assert 'before' not in item and 'after' not in item
output = root / 'dist' / 'JSONPreview.popclipextz'
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        info = zipfile.ZipInfo(f'{package.name}/{name}', (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (package / name).read_bytes())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == len(files)
print(f'Built {output} ({output.stat().st_size} bytes)')
