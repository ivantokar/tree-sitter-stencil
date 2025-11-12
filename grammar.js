const PREC = {
  pipe: 1,
  or: 2,
  and: 3,
  compare: 4,
  range: 5,
  additive: 6,
  multiplicative: 7,
  unary: 8,
  call: 9,
  member: 10
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
      repeat($._node),

    _node: $ => choice(
      $.text,
      $.comment,
      $.output,
      $.if_block,
      $.for_block,
      $.block_block,
      $.macro_block,
      $.raw_block,
      $.filter_block,
      $.extends_tag,
      $.include_tag,
      $.assignment_tag,
      $.generic_tag
    ),

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

    if_block: $ =>
      seq(
        field('condition', $.if_tag),
        field('body', repeat($._node)),
        repeat(field('alternative', $.elif_clause)),
        optional(field('alternative', $.else_clause)),
        field('end', $.endif_tag)
      ),

    if_tag: $ =>
      seq(
        '{%',
        'if',
        field('condition', $.expression),
        '%}'
      ),

    elif_clause: $ =>
      prec.right(1,
        seq(
          field('tag', $.elif_tag),
          field('body', repeat($._node))
        )
      ),

    elif_tag: $ =>
      seq(
        '{%',
        'elif',
        field('condition', $.expression),
        '%}'
      ),

    else_clause: $ =>
      prec.right(1,
        seq(
          field('tag', $.else_tag),
          field('body', repeat($._node))
        )
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

    for_block: $ =>
      seq(
        field('loop', $.for_tag),
        field('body', repeat($._node)),
        field('end', $.endfor_tag)
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

    extends_tag: $ =>
      seq(
        '{%',
        'extends',
        field('template', $.expression),
        '%}'
      ),

    block_block: $ =>
      seq(
        field('start', $.block_tag),
        field('body', repeat($._node)),
        field('end', $.endblock_tag)
      ),

    block_tag: $ =>
      seq(
        '{%',
        'block',
        field('name', $.identifier),
        '%}'
      ),

    endblock_tag: $ =>
      seq(
        '{%',
        'endblock',
        optional(field('name', $.identifier)),
        '%}'
      ),

    macro_block: $ =>
      seq(
        field('start', $.macro_tag),
        field('body', repeat($._node)),
        field('end', $.endmacro_tag)
      ),

    macro_tag: $ =>
      seq(
        '{%',
        'macro',
        field('name', $.identifier),
        optional(field('parameters', $.macro_parameters)),
        '%}'
      ),

    macro_parameters: $ =>
      seq(
        '(',
        optional(seq($.macro_parameter, repeat(seq(',', $.macro_parameter)))),
        ')'
      ),

    macro_parameter: $ =>
      seq(
        field('name', $.identifier),
        optional(seq('=', field('default', $.expression)))
      ),

    endmacro_tag: $ =>
      seq(
        '{%',
        'endmacro',
        '%}'
      ),

    raw_block: $ =>
      seq(
        field('start', $.raw_tag),
        field('body', repeat($._node)),
        field('end', $.endraw_tag)
      ),

    raw_tag: $ =>
      seq(
        '{%',
        'raw',
        '%}'
      ),

    endraw_tag: $ =>
      seq(
        '{%',
        'endraw',
        '%}'
      ),

    filter_block: $ =>
      seq(
        field('start', $.filter_tag),
        field('body', repeat($._node)),
        field('end', $.endfilter_tag)
      ),

    filter_tag: $ =>
      seq(
        '{%',
        'filter',
        field('name', $.identifier),
        optional(seq(':', field('arguments', $.arguments))),
        '%}'
      ),

    endfilter_tag: $ =>
      seq(
        '{%',
        'endfilter',
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
      prec.left(
        seq(
          $.argument,
          repeat(seq(',', $.argument))
        )
      ),

    argument: $ => choice(
      field('value', $.or_expression),
      seq(
        field('name', $.identifier),
        '=',
        field('value', $.or_expression)
      )
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
          $.range_expression,
          repeat(seq(choice('==', '!=', '>=', '<=', '>', '<'), $.range_expression))
        )
      ),

    range_expression: $ =>
      choice(
        $.additive_expression,
        prec.left(PREC.range,
          seq(
            $.additive_expression,
            '..',
            $.additive_expression
          )
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
      $.list_literal,
      $.dict_literal,
      $.call_expression,
      $.subscript_expression,
      $.member_expression,
      $.identifier,
      $.parenthesized_expression
    ),

    call_expression: $ =>
      prec.left(PREC.call,
        seq(
          field('function', choice($.identifier, $.member_expression, $.subscript_expression, $.call_expression)),
          field('arguments', $.call_arguments)
        )
      ),

    call_arguments: $ =>
      seq(
        '(',
        optional(seq(
          $.argument,
          repeat(seq(',', $.argument))
        )),
        ')'
      ),

    subscript_expression: $ =>
      prec.left(PREC.member,
        seq(
          field('collection', choice($.identifier, $.member_expression, $.call_expression, $.subscript_expression)),
          '[',
          field('index', $.expression),
          ']'
        )
      ),

    member_expression: $ =>
      prec.left(PREC.member,
        seq(
          choice($.identifier, $.subscript_expression, $.call_expression),
          repeat1(seq('.', $.identifier))
        )
      ),

    list_literal: $ =>
      seq(
        '[',
        optional(seq($.expression, repeat(seq(',', $.expression)))),
        ']'
      ),

    dict_literal: $ =>
      seq(
        '{',
        optional(seq($.dict_entry, repeat(seq(',', $.dict_entry)))),
        '}'
      ),

    dict_entry: $ =>
      seq(
        field('key', choice($.identifier, $.string)),
        ':',
        field('value', $.expression)
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
