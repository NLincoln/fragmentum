---
id: what-are-fragments
title: What Are Fragments?
sidebar_label: What Are Fragments?
---

A _Fragment_ is a single piece of a SQL query, such as a SELECT statement, WHERE clause, or a JOIN clause.
It reprensents a single part of a SQL query that could be omitted from the query, and still be (syntactically) valid.

For example:
```js
const { builder, select } = require('fragmentum');

const { query } = builder(
  select()
).serialize();

console.log(query);
// > SELECT *
```

Fragments can be composed together using a _Builder_. A builder can compose fragments in 3 ways:
```js
const { builder, select } = require('fragmentum');

const { query } = builder(
  select('id') // Method #1
)
.from('users') // Method #2
.concat(
  select('username') // Method #3
)
.serialize();
```

1. Providing them in the call to `builder()`
2. Calling the fragments method on the `Builder` instance
3. Providing them as an argument to `Builder#concat`

You'll usually be using methods 1 and 2, although method 3 100% fine as well.
