---
id: immutability
title: Immutability
sidebar_label: Immutability
---

Fragmentum has been designed from the ground up with immutability in mind. This means that no operation - no matter what - will mutate a query. Only new queries are created.

```js
let queryA = builder(select());

let queryB = queryA.concat(from("users"));

// queryA: `SELECT *`
// queryB: `SELECT * FROM "users"`
```

The downside to immutability is you might find yourself writing code like the following:

```js
let queryA = builder(select());

if (someCondition) {
  queryA = queryA.where(ops.eq("user_id", bind("user_id", 2)));
}
```

In this case, the query can be rewritten to utilize _conditional fragments_, which are discussed further in [conditional fragments](conditional-fragments.md):

```js
let queryA = builder(
  select(),
  someCondition && where(ops.eq("user_id", bind("user_id", 2)))
);
```
