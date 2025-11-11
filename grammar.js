const PREC = {
  pipe: 1,
  or: 2,
  and: 3,
  compare: 4,
  additive: 5,
  multiplicative: 6,
  unary: 7
};

module.exports = grammar({
  name: 'stencil',

  extras: $ => [
    /\s+/
  ],

  supertypes: $ => [
    $.expression
  ],

  rules: {
    source_file: $ =>
      repeat(choice(
        $.text,
        $.comment,
        $.output,
        $.if_tag,
        $.elif_tag,
        $.else_tag,
        $.endif_tag,
        $.for_tag,
        $.endfor_tag,
        $.assignment_tag,
        $.include_tag,
        $.generic_tag
      )),

    text: $ =>
      token(prec(-1,
        repeat1(choice(
          /[^{]+/,
          /\{[^%#\{]/
        ))
      )),

    comment: $ =>
      seq(
        '{#',
        repeat(choice(
          /[^#]/,
          /#[^}]/
        )),
        '#}'
      ),

    output: $ =>
      seq(
        '{{',
        field('expression', $.expression),
        '}}'
      ),

    if_tag: $ =>
      seq(
        '{%',
        'if',
        field('condition', $.expression),
        '%}'
      ),

    elif_tag: $ =>
      seq(
        '{%',
        'elif',
        field('condition', $.expression),
        '%}'
      ),

    else_tag: $ =>
      seq(
        '{%',
        'else',
        '%}'
      ),

    endif_tag: $ =>
      seq(
        '{%',
        'endif',
        '%}'
      ),

    for_tag: $ =>
      seq(
        '{%',
        'for',
        field('variable', $.identifier),
        'in',
        field('collection', $.expression),
        repeat(field('parameter', $.for_parameter)),
        '%}'
      ),

    assignment_tag: $ =>
      seq(
        '{%',
        choice('set', 'assign'),
        field('target', $.identifier),
        '=',
        field('value', $.expression),
        '%}'
      ),

    include_tag: $ =>
      seq(
        '{%',
        choice('include', 'render'),
        field('template', $.expression),
        repeat(field('argument', $.expression)),
        '%}'
      ),

    for_parameter: $ => choice(
      'reversed',
      seq(field('name', $.identifier), ':', field('value', $.expression))
    ),

    endfor_tag: $ =>
      seq(
        '{%',
        'endfor',
        '%}'
      ),

    generic_tag: $ =>
      seq(
        '{%',
        field('name', $.identifier),
        repeat(field('argument', $.expression)),
        '%}'
      ),

    expression: $ => $.pipe_expression,

    pipe_expression: $ =>
      seq(
        $.or_expression,
        repeat($.filter_chain)
      ),

    filter_chain: $ =>
      seq(
        '|',
        field('name', $.identifier),
        optional(seq(':', field('arguments', $.arguments)))
      ),

    arguments: $ =>
      seq(
        $.or_expression,
        repeat(seq(',', $.or_expression))
      ),

    or_expression: $ =>
      prec.left(PREC.or,
        seq(
          $.and_expression,
          repeat(seq('or', $.and_expression))
        )
      ),

    and_expression: $ =>
      prec.left(PREC.and,
        seq(
          $.not_expression,
          repeat(seq('and', $.not_expression))
        )
      ),

    not_expression: $ =>
      choice(
        $.comparison_expression,
        prec.right(PREC.unary, seq('not', $.not_expression))
      ),

    comparison_expression: $ =>
      prec.left(PREC.compare,
        seq(
          $.additive_expression,
          repeat(seq(choice('==', '!=', '>=', '<=', '>', '<'), $.additive_expression))
        )
      ),

    additive_expression: $ =>
      prec.left(PREC.additive,
        seq(
          $.multiplicative_expression,
          repeat(seq(choice('+', '-'), $.multiplicative_expression))
        )
      ),

    multiplicative_expression: $ =>
      prec.left(PREC.multiplicative,
        seq(
          $.unary_expression,
          repeat(seq(choice('*', '/', '%'), $.unary_expression))
        )
      ),

    unary_expression: $ =>
      choice(
        $.primary_expression,
        prec.right(PREC.unary, seq('-', $.unary_expression))
      ),

    primary_expression: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.nil,
      $.member_expression,
      $.identifier,
      $.parenthesized_expression
    ),

    member_expression: $ =>
      seq(
        $.identifier,
        repeat1(seq('.', $.identifier))
      ),

    parenthesized_expression: $ =>
      seq('(', $.expression, ')'),

    string: $ =>
      choice(
        seq('"', repeat(choice($.escape_sequence, /[^"\\]/)), '"'),
        seq("'", repeat(choice($.escape_sequence, /[^'\\]/)), "'")
      ),

    escape_sequence: $ => token(seq('\\', /./)),

    number: $ => token(seq(optional('-'), /\d+(\.\d+)?/)),

    boolean: $ => choice('true', 'false'),

    nil: $ => choice('nil', 'null'),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/
  }
});
