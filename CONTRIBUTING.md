# Contributing to tree-sitter-stencil

Thank you for your interest in contributing! This document covers how to set up the development environment, make changes, and submit a pull request.

## Prerequisites

- **Node.js ≥ 18** and **npm** — used to run the tree-sitter CLI and tests.
- **tree-sitter CLI** — install once:
  ```bash
  brew install tree-sitter-cli          # macOS
  npm install -g tree-sitter-cli        # any platform
  cargo install tree-sitter-cli         # via Rust
  ```
- **Git** — standard version control.

## Development Workflow

```bash
# 1. Clone and install deps
git clone https://github.com/ivantokar/tree-sitter-stencil
cd tree-sitter-stencil
npm install

# 2. Edit grammar.js, then regenerate the parser
npm run generate   # writes src/parser.c and src/node-types.json

# 3. Run the corpus tests
npm test
```

## Repository Layout (key files)

| Path | Purpose |
|------|---------|
| `grammar.js` | Grammar rules (source of truth) |
| `src/parser.c` | Generated parser — **do not edit by hand** |
| `src/scanner.c` | Hand-written external C scanner for `raw_body` |
| `corpus/` | Parser test fixtures |
| `queries/stencil/` | Highlight / indent / locals queries |

### External scanner (`src/scanner.c`)

The `raw_body` token inside `{% raw %}…{% endraw %}` is handled by an external scanner rather than grammar rules. This is necessary because the grammar cannot express "match everything except `{% endraw %}`" purely via PEG rules. The scanner reads characters one at a time and stops (without consuming) when it detects `{% endraw %}`, leaving the closing tag for the normal parser. If you modify the scanner, rebuild with `npm run generate && npm install` to recompile the native binding.

## Adding Grammar Features

1. Edit `grammar.js` to add or adjust a rule.
2. Run `npm run generate` to refresh the generated parser.
3. Add at least one corpus fixture in `corpus/` that exercises the new construct. Fixtures follow the format:

   ```
   ==================
   Descriptive Title
   ==================

   {% your_new_tag %}

   ---

   (source_file
     (your_new_node …))
   ```

4. Run `npm test` and confirm all tests pass.
5. If the change affects highlighting, update `queries/stencil/highlights.scm` and refresh the screenshots in `assets/`.

## Query Files

| File | Purpose |
|------|---------|
| `queries/stencil/highlights.scm` | Syntax highlighting captures for Neovim/editors |
| `queries/stencil/locals.scm` | Variable scope and definition tracking |
| `queries/stencil/indents.scm` | Indentation hints |

Prefer adding to the correct file rather than shoe-horning captures into the wrong query.

## Commit Style

Use the imperative mood in commit messages:

```
Add import_tag parser rule
Fix highlights for filter_chain
Update corpus: add dict_literal edge case
```

Group grammar changes (`grammar.js`, generated `src/`) together in one commit. Include query updates in the same commit when they accompany grammar additions.

## Pull Requests

- Keep PRs focused — one feature or fix per PR.
- Include updated corpus entries and, if highlighting changes, updated screenshots.
- State in the PR description whether users need to re-run `:TSInstallFromGrammar stencil`.

## Versioning

Version bumps are done via the helper script:

```bash
./scripts/bump-version.sh 0.4.0
```

This updates `VERSION`, `package.json`, `Cargo.toml`, `pyproject.toml`, and `Makefile` atomically. Maintainers handle releases.

## Reporting Issues

Open a GitHub issue at <https://github.com/ivantokar/tree-sitter-stencil/issues> with:

- The Stencil snippet that fails to parse or highlight incorrectly.
- The tree output from `tree-sitter parse` (run `npx tree-sitter parse your_file.stencil`).
- Your tree-sitter CLI version (`tree-sitter --version`).
