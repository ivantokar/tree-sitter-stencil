; Opening tags mark the start of an indented block.
; @indent.begin is applied to the tag node itself (not to its body children)
; so only one indent level is opened per block, regardless of how many body
; nodes exist.
(if_tag) @indent.begin
(for_tag) @indent.begin
(block_tag) @indent.begin
(macro_tag) @indent.begin
(filter_tag) @indent.begin
(raw_tag) @indent.begin

; Branch tags dedent themselves back to the opening keyword's column, then
; let their body content be indented.  Using @indent.branch (rather than
; @indent.begin) prevents a double-indent when an elif/else immediately
; follows an if/elif body.
(elif_clause (elif_tag) @indent.branch)
(else_clause (else_tag) @indent.branch)

; Closing tags mark the end of an indented block.
(endif_tag) @indent.end
(endfor_tag) @indent.end
(endblock_tag) @indent.end
(endmacro_tag) @indent.end
(endfilter_tag) @indent.end
(endraw_tag) @indent.end
