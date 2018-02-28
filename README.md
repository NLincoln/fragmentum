# Fragmentum [![Build Status](https://travis-ci.org/NLincoln/fragmentum.svg?branch=master)](https://travis-ci.org/NLincoln/fragmentum) [![Maintainability](https://api.codeclimate.com/v1/badges/97edcdd4747c26ca32ef/maintainability)](https://codeclimate.com/github/NLincoln/fragmentum/maintainability)

> A Query Builder for dynamic PostgreSQL queries (MySQL support planned too)

Fragmentum allows you to create SQL queries dynamically based off of an array of conditions with ease.

```js
import { builder, select, from, where, bind, eq } from "fragmentum";

builder(
  select("username", "user_id"),
  from("users"),
  where(eq("username", bind("username", 2)))
).serialize();

// >> SELECT "username", "user_id" FROM "users" WHERE "username" = '2';
```
# Install
```sh
$ yarn add fragmentum
```

Then

```js
// es6
import { builder } from 'fragmentum';
// commonjs
const { builder } = require('fragmentum');
```
# About

In Fragmentum, a query is composed of _fragments_, which are discrete parts of a query fragmentum understands
how to compose together dynamically.

For example, imagine you're writing a REST api with optional query-string values:

```js
app.get("/users", async (req, res) => {
  const sql = builder(
    select("username", "user_id"),
    from("users"),
    req.query.username &&
      where(eq("username", bind("username", req.query.username)))
  ).serialize();

  res.send({
    users: await someDatabaseLibrary.query(sql)
  });
});
```

Even better: what if we wanted to do something more complex, like optionally joining in a table?

```js
const sql = builder(
  shouldJoinUsers && join('users', 'users.group_id', 'group.id'),
).select().from('group')
```
Fragmentum makes it easy to declaratively compose together different pieces of your SQL queries. 

Please note that fragmentum doesn't handle connecting to the database or execution of queries. It just generates SQL, and
it's up to you how to execute it.
