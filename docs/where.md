# Where

This is the _really_ fun part of fragmentum. The first thing to note is how `where` fragments will play together
if you specify more than one of them:

```js
fragment(
  // (don't worry about the `ops` and `value`, we'll get to those in a sec)
  where(ops.eq("user_id", value(123))),
  where(ops.eq("username", value("nlincoln")))
);

// Produces WHERE `user_id` = '123' AND `username` = 'nlincoln'
```
