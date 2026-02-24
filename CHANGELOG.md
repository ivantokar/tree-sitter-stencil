# Changelog

All notable changes to `tree-sitter-stencil` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions track [Semantic Versioning](https://semver.org/).

---

## [0.4.0] – 2026-02-24

### Fixed
- `raw_block` now uses an external C scanner (`src/scanner.c`) that emits a
  single opaque `raw_body` node for everything between `{% raw %}` and
  `{% endraw %}`.  Previously, Stencil delimiters inside the block were parsed
  as live expression / tag nodes, contradicting the engine's runtime behaviour.
- `indents.scm` rewritten: opening tags (`if_tag`, `for_tag`, …) carry
  `@indent.begin`; closing tags carry `@indent.end`; `elif_tag` and `else_tag`
  use `@indent.branch` to avoid double-indentation on branch keywords.  The
  previous scheme applied `@indent.begin` to individual body child nodes.

### Added
- Corpus: comment block parsing, string escape sequences, `{% import %}` as
  `generic_tag`, and empty `{% raw %}{% endraw %}` edge case.
- `CONTRIBUTING.md` — setup, workflow, commit style, PR and issue guidance.
- `CHANGELOG.md` — this file.
- `LICENSE` — MIT, © 2026 Ivan Tokar.

### Fixed (metadata)
- `package.json`: `author` was empty, now `"Ivan Tokar"`.
- `Cargo.toml`, `pyproject.toml`: repository / homepage URLs pointed to the
  `tree-sitter` org; corrected to `ivantokar`.
- `bindings/go/go.mod` and `binding_test.go`: module path corrected to
  `github.com/ivantokar/tree-sitter-stencil`.
- `assets/.DS_Store` removed from git index; `.DS_Store` added to `.gitignore`.

### Documented
- `README.md`: `raw_body` scanner behaviour, clarified `from…import` limitation,
  updated release/versioning section with tag-based publish workflow.

---

## [0.3.0] – 2026-02-24

### Added
- `filter_block` / `endfilter_tag` support (`{% filter upper %}…{% endfilter %}`).
- `macro_block` with typed parameter list including defaults (`{% macro greet(name="Guest") %}`).
- `raw_block` for literal output (`{% raw %}…{% endraw %}`).
- `locals.scm` – scope/definition tracking for `for` loop variables and macro names/parameters.
- `indents.scm` – indentation hints for every block construct.
- `bump-version.sh` script: single-command version bump across `package.json`, `Cargo.toml`, `pyproject.toml`, and `Makefile`.
- Manual-install helper `scripts/install-manual.sh` that clones the parser into Neovim's tree-sitter directory and copies highlight queries.

### Changed
- Highlight query (`highlights.scm`) extended with `filter_tag`, `raw_tag`, `endfilter_tag`, `endraw_tag`, `endmacro_tag`, `generic_tag`, and `for_parameter` patterns.
- Expression hierarchy refined: `pipe_expression → or → and → not → comparison → range → additive → multiplicative → unary → primary`.
- `assignment_tag` now accepts both `set` and `assign` keywords.
- `include_tag` now accepts both `include` and `render` keywords.
- `for_tag` supports named parameters (`limit:`, `reversed`).

---

## [0.2.0] – 2026-01-xx

### Added
- Structured block nodes: `if_block`, `for_block`, `block_block`.
- `elif_clause` / `else_clause` sub-nodes within `if_block`.
- Pipe / filter-chain expressions (`value | filter: arg`).
- List (`[]`) and dictionary (`{}`) literals.
- Range expressions (`0..n`).
- Subscript (`values[0]`) and member (`user.name`) access.
- Function call expressions with positional and keyword arguments.

---

## [0.1.0] – 2024-xx-xx

### Added
- Initial grammar covering `{{ }}` output tags, `{% %}` control tags, and `{# #}` comments.
- Basic `if`/`elif`/`else`/`endif` and `for`/`endfor` parsing.
- `extends_tag`, `include_tag`, and `assignment_tag`.
- `highlights.scm` for Neovim syntax highlighting via nvim-treesitter.
