# Fragmentum [![Build Status](https://travis-ci.org/NLincoln/fragmentum.svg?branch=master)](https://travis-ci.org/NLincoln/fragmentum)
>  A Query Builder for dynamic PostgreSQL queries (MySQL support planned too)

> :warning: Do not use this in production.

Fragmentum allows you to create SQL queries dynamically based off of an array of conditions with ease. 

```js
import { Builder, select, from, where, eq, value } from  'fragmentum';

new Builder([
  select('username', 'user_id'),
  from('users'),
  where(eq('username', value('NLincoln'))),
]).serialize();
// >> SELECT "username", "user_id" FROM "users" WHERE "username" = '2';
```

> :warning: API is not finalized yet

In Fragmentum, a query is composed of _fragments_, which are discrete parts of a query fragmentum understands
how to compose together dynamically.

For example, imagine you're writing a REST api with optional query-string values:

```js
app.get('/users', async (req, res) => {
  const sql = new Builder([
    select('username', 'user_id'),
    from('users'),
    req.query.username && where(eq('username', value(req.query.username))),
  ]).serialize();
  
  res.send({
    users: await someDatabaseLibrary.query(sql)
  });
});
```

Please note that fragmentum doesn't handle connecting to the database or execution of queries. It just generates SQL, and 
it's up to you how to execute it.
