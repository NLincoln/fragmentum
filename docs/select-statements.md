---
id: select-statements
title: Basic Query Building
sidebar_label: Query Building
---

# Select

```js
builder().select("id", "user.id", ["user.id", "alias"], {
  "user.id": "alias2"
});
```

`SELECT "id", "user"."id", "user"."id" AS "alias", "user"."id" AS "alias2"`

## Subqueries

```js
builder().select(
  builder()
  .setAlias('sub')
  .select('id')
  .from('users')
  .where(ops.eq('id', value(2)));
)
```

`SELECT * FROM (SELECT "id" FROM "users" WHERE ("id" = '2')) AS "sub"`

# From

```js
builder().from("users", "groups");
```

`'FROM "users", "groups"'`

## Subqueries

```js
builder().from(
  builder()
    .setAlias("alias")
    .select()
    .from("users")
);
```

`FROM (SELECT * FROM "users") AS "alias"`

# Where

# Group By

# Having

# Order By

# Limit/Offset
