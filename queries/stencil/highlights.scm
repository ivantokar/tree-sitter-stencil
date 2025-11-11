((comment) @comment)

((string) @string)

((number) @number)

((boolean) @constant.builtin)

((nil) @constant.builtin)

["{{" "}}"] @punctuation.bracket

["{%" "%}"] @punctuation.special

["{#" "#}"] @punctuation.special

(if_tag
  "if" @keyword)

(elif_tag
  "elif" @keyword)

(else_tag
  "else" @keyword)

(endif_tag
  "endif" @keyword)

(for_tag
  "for" @keyword
  "in" @keyword)

(endfor_tag
  "endfor" @keyword)

(assignment_tag
  ["set" "assign"] @keyword
  target: (identifier) @variable)

(include_tag
  ["include" "render"] @keyword)

(generic_tag
  name: (identifier) @function.call)

(filter_chain
  name: (identifier) @function.builtin)

(for_parameter
  name: (identifier) @property)

((identifier) @variable)
