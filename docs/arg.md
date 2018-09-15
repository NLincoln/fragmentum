An arg represents a value to be filled in later.

Let's say, for example, that you want to create some generic way to query for some table:

```js
let getTable = from(arg("table"));
```

Now, currently the `getTable` fragment doesn't have a value for it's `table` arg. Attempting to execute this
fragment as-is will result in an error:

```js
execute(getTable); // THIS WILL ERROR
```

So we need to provide the table we want to query for:

```js
let getUserTable = getTable({ table: "users" });
```

This fragment can now be executed.

# Renaming args

Arguments can't be renamed per-se, but the given value for an argument can itself be another arg:

```js
let getTwoTables = fragment(
  getTable({
    table: arg("first-table")
  }),
  getTable({
    table: arg("second-table")
  })
);

let { query } = execute(
  getTwoTables({
    "first-table": "users",
    "second-table": "other-users"
  })
);
```

# Transforming arg values

You can provide a 2nd argument to `arg()`, which will be called when a value is received on that arg.

```js
let getTableRenamed = from(arg("table", table => `prefixed_${table}`));

let { query } = execute(
  getTableRenamed({
    table: "users"
  })
);

console.log(query);
// > FROM `prefixed_users`
```
