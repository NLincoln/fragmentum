# `fragment()`

Collects a bunch of other fragments into one.

```js
let getUserTable = fragment(
  select("id"),
  select("user_id", "email"),
  from("users")
);
```

Fragments can also consume other fragmnents. The following is equivalent to the above:

```js
fragment(
  fragment(select("id")),
  fragment(select("user_id", "email"), from("users"))
);
```
