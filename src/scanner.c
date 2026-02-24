/**
 * External scanner for tree-sitter-stencil.
 *
 * Handles the `raw_body` token inside a {% raw %}…{% endraw %} block so
 * that Stencil delimiters inside the block are treated as plain text rather
 * than parsed as expression / tag nodes.
 *
 * Algorithm
 * ---------
 * When the parser requests RAW_BODY we scan character by character.
 * Every time we see '{' we call mark_end() to record a potential token
 * boundary just before it, then speculatively read ahead:
 *   - If the next two chars are not '%'          → treat '{' as content,
 *                                                   continue.
 *   - If '{%' is followed (ignoring whitespace)
 *     by "endraw" and then whitespace / '%' / EOF → stop here; return
 *                                                   RAW_BODY up to the
 *                                                   mark_end position
 *                                                   (i.e. before '{').
 *   - Otherwise                                  → treat consumed chars as
 *                                                   content, continue.
 *
 * Author: Ivan Tokar
 */

#include "tree_sitter/parser.h"

enum TokenType {
  RAW_BODY,
};

void *tree_sitter_stencil_external_scanner_create(void)  { return NULL; }
void  tree_sitter_stencil_external_scanner_destroy(void *payload) { (void)payload; }
unsigned tree_sitter_stencil_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload; (void)buffer;
  return 0;
}
void tree_sitter_stencil_external_scanner_deserialize(
  void *payload, const char *buffer, unsigned length
) {
  (void)payload; (void)buffer; (void)length;
}

bool tree_sitter_stencil_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  (void)payload;

  if (!valid_symbols[RAW_BODY]) {
    return false;
  }

  static const char ENDRAW[] = "endraw";
  bool has_content = false;

  for (;;) {
    /* EOF — break out and emit what we have (if any). */
    if (lexer->lookahead == 0) {
      break;
    }

    if (lexer->lookahead != '{') {
      lexer->advance(lexer, false);
      has_content = true;
      continue;
    }

    /*
     * We are sitting on '{'.  Mark the current position as a candidate
     * token end (everything consumed before this point becomes the token
     * if we return true here).
     */
    lexer->mark_end(lexer);

    /* Consume '{' */
    lexer->advance(lexer, false);

    if (lexer->lookahead != '%') {
      /* e.g. "{{ expr }}" — treat the '{' as plain text and continue. */
      has_content = true;
      continue;
    }

    /* Consume '%' */
    lexer->advance(lexer, false);

    /* Skip optional whitespace between {% and the keyword. */
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
      lexer->advance(lexer, false);
    }

    /* Try to match the literal string "endraw". */
    bool matched = true;
    for (int i = 0; ENDRAW[i] != '\0'; i++) {
      if (lexer->lookahead != (int32_t)ENDRAW[i]) {
        matched = false;
        break;
      }
      lexer->advance(lexer, false);
    }

    /*
     * A successful match requires "endraw" to be followed by whitespace,
     * the closing '%', or EOF — i.e. it must not be a longer identifier
     * like "endraw_something".
     */
    bool boundary =
      lexer->lookahead == ' '  ||
      lexer->lookahead == '\t' ||
      lexer->lookahead == '\n' ||
      lexer->lookahead == '%'  ||
      lexer->lookahead == 0;

    if (matched && boundary) {
      /*
       * Found {% endraw %}.  The token ends at the mark_end position
       * set just before '{'.  The parser will then parse {% endraw %}
       * as a normal endraw_tag node.
       */
      if (has_content) {
        lexer->result_symbol = RAW_BODY;
        return true;
      }
      /* Empty raw body: let the parser handle endraw_tag directly. */
      return false;
    }

    /* Not endraw — the chars we consumed are part of the raw content. */
    has_content = true;
  }

  if (has_content) {
    lexer->mark_end(lexer);
    lexer->result_symbol = RAW_BODY;
    return true;
  }

  return false;
}
