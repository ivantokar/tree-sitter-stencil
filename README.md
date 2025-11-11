# tree-sitter-stencil

Tree-sitter grammar for the Stencil templating language (commonly used across Swift/Stencil projects). The grammar focuses on recognising the templating delimiters (`{{ }}`, `{% %}`, `{# #}`), control flow tags (`if`, `elif`, `else`, `for`, etc.), and the filter expressions that are commonly used inside Stencil templates so that editor integrations (like `nvim-treesitter`) can provide syntax highlighting and structural awareness.

> **Note:** This initial version treats each `{% %}` block independently. Matching/validation of `if/elif/else` or `for/endfor` pairs is not enforced yet. The goal is to provide reliable highlighting and navigation first, then iterate on deeper structural analysis.

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

## Using with nvim-treesitter

Until the parser is upstreamed you can register it manually inside your Neovim config:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.stencil = {
  install_info = {
    url = "/absolute/path/to/tree-sitter-stencil",
    files = { "src/parser.c" },
  },
  filetype = "stencil",
}

-- optional: associate *.stencil files with the filetype
vim.filetype.add({
  extension = {
    stencil = "stencil",
  },
})
```

After reloading Neovim you can run `:TSInstallFromGrammar stencil` (or `:TSBufEnable highlight`) to enable highlighting for `.stencil` files.
