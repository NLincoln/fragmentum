Subqueries are one of the most useful and powerful parts of SQL, and getting support for them right is extremely important.

Let's look at one scenario: executing a query where the table in the `from()` fragment is a subquery:

```js
/**
 * Note: this doesn't work. Scroll down for working code
 */
let subquery = fragment(
  from(
    fragment(select("*"), from(arg("table")))({
      table: "users"
    })
  )
);
```

However, this doesn't work. In SQL, each subquery must be _aliased_. Additionally, this code will produce a syntactically invalid
query (work is being done to cause the above fragment to error instead)

Instead, we need another type of fragment: the `subquery()`. Let's check it out:

```js
let subquery = fragment(
  from(subquery("alias", fragment(select("*"), from("users"))))
);
```

# Limitations of subquery()

Subqueries cannot appear as siblings: the following is an invalid fragment (and will error)

```js
// The following code will produce an error, due to having two subqueries as siblings.
let subquery = fragment(
  subquery("alias", fragment(select("*"), from("users"))),
  subquery("alias2", fragment(select("*"), from("permissions")))
);
```

The reason for this is that there is no way to _combine_ subqueries.
