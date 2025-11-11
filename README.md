# tree-sitter-stencil

Tree-sitter grammar for the Stencil templating language (commonly used across Swift/Stencil projects). The grammar focuses on recognising the templating delimiters (`{{ }}`, `{% %}`, `{# #}`), control flow tags (`if`, `elif`, `else`, `for`, etc.), and the filter expressions that are commonly used inside Stencil templates so that editor integrations (like `nvim-treesitter`) can provide syntax highlighting and structural awareness.

> **Note:** This initial version treats each `{% %}` block independently. Matching/validation of `if/elif/else` or `for/endfor` pairs is not enforced yet. The goal is to provide reliable highlighting and navigation first, then iterate on deeper structural analysis.

## Neovim Installation (nvim-treesitter)

Stencil isn’t bundled with `nvim-treesitter` yet, so register it manually:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.stencil = {
  install_info = {
    url = "https://github.com/ivantokar/tree-sitter-stencil",
    files = { "src/parser.c" },
  },
  filetype = "stencil",
}

vim.filetype.add({
  extension = {
    stencil = "stencil",
  },
})
```

After reloading Neovim you can install the parser via your preferred plugin manager:

```vim
" Packer
use({
  "nvim-treesitter/nvim-treesitter",
  run = ":TSUpdate",
})
vim.cmd("TSInstallFromGrammar stencil")

" Lazy.nvim (inside the spec)
{
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  config = function()
    require("nvim-treesitter.configs").setup({
      highlight = { enable = true },
    })
    vim.cmd("TSInstallFromGrammar stencil")
  end,
}

" Vimscript fallback
:TSInstallFromGrammar stencil
```

If you prefer hacking on a local clone, change the `url` to an absolute path (e.g., `/Users/you/code/tree-sitter-stencil`) before running `:TSInstallFromGrammar stencil` or `:TSBufEnable highlight`.

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
