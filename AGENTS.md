# Repository Guidelines

## Project Structure & Module Organization
- `grammar.js`, `src/`, and `binding.gyp` contain the Tree-sitter grammar plus generated artifacts (`src/parser.c`, `src/node-types.json`). Regenerate via the CLI rather than editing generated files directly.
- `corpus/` holds parser fixtures. Each `==================` block should mirror real `.stencil` snippets gathered from `mage/Sources/Mage/Templates`.
- `queries/stencil/` stores highlight queries. Keep one language per folder so Neovim loads them automatically.
- `scripts/install-manual.sh` is the end-user helper for cloning into `~/.local/share/nvim/tree-sitter`. Update it whenever installation paths change.
- `assets/` contains README visuals; keep large binaries out of Git history unless essential.

## Build, Test, and Development Commands
- `npm install` — installs `tree-sitter-cli`, `node-addon-api`, and other build deps. Run once per checkout.
- `npm run generate` — executes `tree-sitter generate`, refreshing `src/parser.c` and `src/node-types.json`.
- `npm test` — shorthand for `tree-sitter test`; validates the grammar against `corpus/`.
- `scripts/install-manual.sh` — clones or updates the parser directly into Neovim’s parser directory and copies highlight queries to `~/.config/nvim/queries/stencil`.

## Coding Style & Naming Conventions
- JavaScript files use 2-space indentation and modern `const`/`let`. Avoid trailing commas in grammar arrays to minimize merge conflicts.
- Corpus fixtures mirror actual Stencil templates; prefer descriptive section headers such as `Assignment Tag`.
- Scripts should be POSIX-compatible Bash with `set -euo pipefail` and informative logging (`highlight/info/warn` helpers already defined).

## Testing Guidelines
- Add new grammar features alongside corpus additions. Use minimal but representative snippets (e.g., `{% assign foo = bar %}`).
- Run `npm test` before committing; CI assumes generated artifacts match `grammar.js`.
- When reproducing Mage templates, anonymize sensitive names but keep structural constructs intact.

## Commit & Pull Request Guidelines
- Use imperative commit messages (`Add include_tag parser rule`, `Fix highlights path`). Group grammar + generated artifacts in the same commit.
- PRs should include: a summary of grammar/query changes, updated corpus entries, screenshots if highlighting changes (update `assets/` accordingly), and manual-install instructions when scripts change.
- Reference related issues (`Fixes #12`) and mention whether users must re-run `:TSInstallFromGrammar stencil`.

# ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in .agent/PLANS.md) from design to implementation.
