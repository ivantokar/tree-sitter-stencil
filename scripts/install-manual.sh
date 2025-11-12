#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/ivantokar/tree-sitter-stencil"
PARSER_DIR="$HOME/.local/share/nvim/tree-sitter"
CONFIG_QUERY_DIR="$HOME/.config/nvim/queries/stencil"

highlight() {
  printf '\033[1;32m%s\033[0m\n' "$1"
}

warn() {
  printf '\033[1;33m%s\033[0m\n' "$1"
}

info() {
  printf '\033[1;34m%s\033[0m\n' "$1"
}

if ! command -v tree-sitter >/dev/null 2>&1; then
  warn "tree-sitter CLI not found. Install it first (brew install tree-sitter-cli, npm install -g tree-sitter-cli, etc.)."
  exit 1
fi

info "Creating parser directory at $PARSER_DIR"
mkdir -p "$PARSER_DIR"
cd "$PARSER_DIR"

if [ -d stencil ]; then
  info "Existing stencil directory found. Pulling latest changes."
  cd stencil
  git pull --rebase
else
  info "Cloning parser repo from $REPO_URL"
  git clone "$REPO_URL" stencil
  cd stencil
fi

git checkout main

if command -v npm >/dev/null 2>&1; then
  info "Installing dependencies"
  npm install
  info "Generating parser"
  npx tree-sitter generate
else
  warn "npm not found; skipping parser regeneration"
fi

info "Copying query files to $CONFIG_QUERY_DIR"
mkdir -p "$CONFIG_QUERY_DIR"
for query in highlights.scm locals.scm indents.scm; do
  if [ -f "queries/stencil/$query" ]; then
    cp "queries/stencil/$query" "$CONFIG_QUERY_DIR/$query"
  fi
done

highlight "Done. Restart Neovim and run :TSBufEnable highlight inside a .stencil buffer."
