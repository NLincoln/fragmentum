---
id: what-are-fragments
title: What Are Fragments?
sidebar_label: What Are Fragments?
---

A _Fragment_ is a single piece of a SQL query, such as a SELECT statement, WHERE clause, or a JOIN clause.
It represents a single part of a SQL query that could be omitted from the query, and still be (syntactically) valid.

For example:

```js
const { builder, select } = require("fragmentum");

const { query } = builder(select()).serialize();

console.log(query);
// > SELECT *
```

Fragments can be composed together using a _Builder_. A builder can compose fragments in 3 ways:

```js
const { builder, select } = require("fragmentum");

const { query } = builder(
  select("id") // Method #1
)
  .from("users") // Method #2
  .concat(
    select("username") // Method #3
  )
  .serialize();
// SELECT "id", "username" FROM "users"
```

1.  Providing them in the call to `builder()`
2.  Calling the fragments method on the `Builder` instance
3.  Providing them as an argument to `Builder#concat`

You'll usually be using methods 1 and 2, although method 3 100% fine as well.

# What is a Builder?

Builders take in fragments and produce syntactically-valid SQL queries.

Optionally, builders can take in other builders. While the following may be a bit strange, builders composing from builders
is a common operation in fragmentum. It usually arises from a function returning a builder that is then used in another builder.
For example:

```js
const { builder, select } = require("fragmentum");

const getUserNameColumns = () => builder(select("username", "firstname"));
const getUserGroup = () => builder(select("group"));
builder(getUserNameColumns(), getUserGroup());
// SELECT "username", "firstname", "group"
```

# What are Expressions?

An expression is similar to a fragment, aside from one major difference: expressions cannot be given to a Builder to
create a SQL query. A builder wouldn't have any idea what to do with it. If you think you need to provide an expression to
a builder, e.g. to serialize it, go check out [embedding](embedding.md).

We'll take a closer look at expressions in [Basic Query Building](select-statements.md)
