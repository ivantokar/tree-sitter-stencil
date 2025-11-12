# tree-sitter-stencil

Tree-sitter grammar for the [Stencil](https://github.com/stencilproject/Stencil) templating language (commonly used across Swift/Stencil projects). The grammar focuses on recognising the templating delimiters (`{{ }}`, `{% %}`, `{# #}`), control flow tags (`if`, `elif`, `else`, `for`, etc.), and the filter expressions that are commonly used inside Stencil templates so that editor integrations (like `nvim-treesitter`) can provide syntax highlighting and structural awareness.

⚠️ **Under construction:** Expect rapid changes while the parser/queries mature. Pull the latest version before reporting issues.

<p align="center">
   <img src="https://github.com/ivantokar/tree-sitter-stencil/blob/main/assets/stencil-example.jpg?raw=1" width="900">
</p>

> **Note:** Control blocks are parsed structurally for highlighting and navigation, but deeper semantic validation (like ensuring matching `{% block %}` / `{% endblock %}` names) is still out of scope for now.

## Supported Syntax

- Control blocks such as `if/elif/else`, `for`, `block`, `macro`, `filter`, and `raw` parse as structured nodes (`if_block`, `for_block`, etc.) so folding and indentation engines know where scopes begin and end.
- Expressions support list/dictionary literals (`[]`, `{}`), range literals (`0..n`), subscripts (`values[0]`), dotted lookups (`user.name`), and function/filter calls with positional or keyword arguments.
- Highlight queries now ship alongside `locals.scm` and `indents.scm`, enabling Treesitter-aware highlighting, scope tracking, and indentation in Neovim.

## Neovim Installation (nvim-treesitter)

Stencil isn’t bundled with `nvim-treesitter` yet, so register it manually. Drop the following snippet somewhere in your Neovim config (e.g., `init.lua`, `lua/plugins/treesitter.lua`, or any file that runs after `nvim-treesitter` loads):

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.stencil = {
  install_info = {
    url = "https://github.com/ivantokar/tree-sitter-stencil",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "stencil",
}

vim.filetype.add({
  extension = {
    stencil = "stencil",
  },
})
```

Then install the parser using your plugin manager of choice:

```lua
-- Packer
use({
  "nvim-treesitter/nvim-treesitter",
  run = ":TSUpdate",
})
-- Once per machine run inside Neovim:
-- :TSInstallFromGrammar stencil
```

```lua
-- Lazy.nvim
{
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  config = function()
    require("nvim-treesitter.configs").setup({
      highlight = { enable = true },
    })
    -- Once per machine run inside Neovim:
    -- :TSInstallFromGrammar stencil
  end,
}
```

```vim
" Vimscript / bare Neovim
:TSInstallFromGrammar stencil
```

If you prefer hacking on a local clone, change the `url` to an absolute path (e.g., `/Users/you/code/tree-sitter-stencil`) before running any of the commands above.

> **Requires `tree-sitter` CLI** – `:TSInstallFromGrammar` shells out to the `tree-sitter` executable. Install it once via your preferred package manager (e.g. `brew install tree-sitter-cli`, `npm install -g tree-sitter-cli`, or `cargo install tree-sitter-cli`) before running the install command.

### Example with lazy.nvim

If you’re using [lazy.nvim](https://github.com/folke/lazy.nvim) like in [ivantokar’s Neovim config](https://github.com/ivantokar/.dotfiles/blob/main/.config/nvim/lua/plugins/treesitter.lua), place the `parser_config` snippet near the top of your Treesitter plugin spec:

```lua
config = function()
  local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
  parser_config.stencil = {
    install_info = {
      url = "https://github.com/ivantokar/tree-sitter-stencil",
      files = { "src/parser.c" },
      branch = "main",
    },
    filetype = "stencil",
  }

  vim.filetype.add({
    extension = {
      stencil = "stencil",
    },
  })

  require("nvim-treesitter.configs").setup({
    -- your existing treesitter settings …
  })

  -- Run inside Neovim once per machine:
  -- :TSInstallFromGrammar stencil
end
```

### Manual install (no `TSInstallFromGrammar`)

If you can’t or don’t want to use the installer, you can wire things up manually:

1. Install the CLI and create the parser directory:

   ```bash
   brew install tree-sitter-cli   # or npm/cargo equivalent
   mkdir -p ~/.local/share/nvim/tree-sitter
   cd ~/.local/share/nvim/tree-sitter
   git clone https://github.com/ivantokar/tree-sitter-stencil stencil
   cd stencil && git checkout main
   ```

2. (Optional) Rebuild the parser if you edit `grammar.js`:

   ```bash
   npm install
   npx tree-sitter generate
   ```

3. Make sure Neovim can see the queries. Either keep them inside the clone (`queries/stencil/*.scm`) or copy them to your config:

   ```bash
   mkdir -p ~/.config/nvim/queries/stencil
   for query in highlights.scm locals.scm indents.scm; do
     cp "queries/stencil/$query" "$HOME/.config/nvim/queries/stencil/$query"
   done
   ```

4. Restart Neovim, load a `.stencil` buffer, and run `:TSBufEnable highlight`. Neovim will use the manually cloned parser/queries without touching `:TSInstallFromGrammar`.

You can automate the steps above by running:

```bash
chmod +x scripts/install-manual.sh
./scripts/install-manual.sh
```

Or from scratch (without an existing checkout):

```bash
git clone https://github.com/ivantokar/tree-sitter-stencil
cd tree-sitter-stencil
chmod +x scripts/install-manual.sh
./scripts/install-manual.sh
```

## Development

```bash
# Install dependencies (node-gyp-build, tree-sitter-cli, etc.)
npm install

# Regenerate parser sources after editing grammar.js
npm run generate

# Run the sample corpus to verify changes
npm test
```

The corpus lives under `corpus/` and can be expanded with more real-world Stencil snippets.

## Versioning & Release

This repository keeps a single source of truth for the current version in the `VERSION` file. To bump a release, run `./scripts/bump-version.sh <major.minor.patch>`. The script writes the new value to `VERSION`, updates `package.json`/`package-lock.json` via `npm version`, and rewrites the matching entries in `Cargo.toml`, `pyproject.toml`, and `Makefile`. Example for `0.2.0`:

```bash
./scripts/bump-version.sh 0.2.0
```

The script prints the checklist of next steps so you (or CI) can follow up immediately.

After bumping:

1. Regenerate parser artifacts if you touched `grammar.js`: `npm run generate`.
2. Run the grammar tests: `npm test`.
3. Commit the changes and tag the release (`git tag v<version>`).
4. Publish to the relevant registries (`npm publish`, `cargo publish`, `python -m build && twine upload dist/*`).

The manual installer script (`scripts/install-manual.sh`) always tracks `main`, so once a tag is published downstream users can opt to pin to that tag through their Neovim parser configuration.
