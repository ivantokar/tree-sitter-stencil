#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/bump-version.sh <new-version>" >&2
  exit 1
fi

NEW_VERSION="$1"

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in MAJOR.MINOR.PATCH form (e.g., 0.2.1)." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required to update package.json and package-lock.json." >&2
  exit 1
fi

cd "$ROOT_DIR"

printf '%s\n' "$NEW_VERSION" > VERSION

npm version "$NEW_VERSION" --allow-same-version --no-git-tag-version >/dev/null

python3 - "$ROOT_DIR" "$NEW_VERSION" <<'PY'
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
version = sys.argv[2]

targets = {
    "Cargo.toml": r'(version\s*=\s*")([0-9]+\.[0-9]+\.[0-9]+)(")',
    "pyproject.toml": r'(version\s*=\s*")([0-9]+\.[0-9]+\.[0-9]+)(")',
    "Makefile": r'(VERSION\s*:=\s*)([0-9]+\.[0-9]+\.[0-9]+)',
}

for rel_path, pattern in targets.items():
    path = root / rel_path
    text = path.read_text()
    regex = re.compile(pattern)
    def repl(match):
        prefix = match.group(1)
        suffix = match.group(3) if match.lastindex and match.lastindex >= 3 else ""
        return f"{prefix}{version}{suffix}"
    new_text, count = regex.subn(repl, text, count=1)
    if count == 0:
        raise SystemExit(f"Failed to update version in {path}")
    path.write_text(new_text)
PY

cat <<EOF
Updated version to $NEW_VERSION.

Next steps:
  1. Regenerate parser artifacts if grammar.js changed: npm run generate
  2. Run tests: npm test
  3. Commit the changes and tag the release (e.g., git tag v$NEW_VERSION)
  4. Publish to npm/cargo/pypi as needed.
EOF
