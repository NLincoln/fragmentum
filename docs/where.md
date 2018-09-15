# Where

This is the _really_ fun part of fragmentum. The first thing to note is how `where` fragments will play together
if you specify more than one of them:

```js
fragment(
  // (don't worry about the `ops` and `value`, we'll get to those in a sec)
  where(ops.eq("user_id", value(123))),
  where(ops.eq("username", value("nlincoln")))
);

// Produces WHERE `user_id` = 123 AND `username` = 'nlincoln'
```

Note that we use the `sqlstring` library to escape values provided. Eventually the goal is to provide support for bind params,
but that isn't possible quite yet.

# Ops

The following ops are currently supported:

- `ops.eq`: =
- `ops.ne`: !=
- `ops.lt`: <
- `ops.gt`: >
- `ops.add`: +
- `ops.in`: IN
- `ops.like`: LIKE

However, this doesn't come close to comprising the full set of operations in SQL. No attempt is made to exhaustively
support the full set of SQL ops.

Instead, the low-level primitives that the above ops use are exposed to the user of the library. One day, a separate support
library might be created with full support, but that would depend on the demand. If you want it, and are willing to help
support it, open an issue :)

# Creating custom ops

If `fragmentum` doesn't have an op that you need (extremely likely), fragmentum exposes the primitive it uses to create the rest
of the ops. They are `createBinaryOp`, `createVariadicOp` and `createUnaryOp`

Note that both of these functions use `createFragment` under the hood, so if you need something _really_ custom, you're free
to use that.

## `ops.createBinaryOp`

Creates an op with a defined left-hand side and a defined right-hand side. `createBinaryOp` automatically validates that
there are exactly two arguments to your op, and that they are both fragments / arguments / strings.

```js
let monadic = ops.createBinaryOp({
  operand: ">>="
});

execute(monadic("lhs", "rhs"));
("`lhs` >>= `rhs`");
```

## `ops.createVariadicOp`

Sometimes you need the op to support _two or more_ arguments (such as with addition `+`). In this case, use `createVariadicOp`.
Like `createBinaryOp`, it will validate that your op has at least 2 arguments, and that each argument is a permissible value.

```js
let superSum = ops.createVariadicOp({
  operand: "++"
});

execute(superSum("first", "second", "third"));
("`first` ++ `second` ++ `third`");
```

## `ops.createUnaryOp`

Finally, there are cases like `in` or `like` that must be supported. These come under the purview of `createUnaryOp`.
Once again, it will validate that exactly one argument has been passed, and that each argument is a permissible value.

```js
let customUnaryOp = ops.createUnaryOp({
  operand: "custom"
});
execute(customUnaryOp(value("some value")));
("custom 'some value'");
```

(To be honest, I'm not sure what the legitimate use cases for this API are, but I'm exposing it nonetheless for completeness)
