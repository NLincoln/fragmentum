---
id: the-new-api
title: New Stuff
sidebar_label: The New API
---

I've never found a SQL query builder I liked. They're all either too underpowered, or rely on mutable state, or
don't allow for good composition. The following is what I'm talking about:

```js
// Difficult to compose, uses mutable internal state. Also can get difficult to follow a more complex query.
table("users")
  .whereEq("user_id", id)
  .columns("*");

// Decent interface for the WHERE clause, but complex queries are OUT.
Users.query({
  where: {
    user_id: id
  }
});
```

Several months ago, I set out to make a query builder I liked. I called it `fragmentum` (latin for fragment), and it looked like this:

```js
// query is a SQL query string, binds are any parameter binds that need to be passed
//  to whatever SQL library you use.
let { query, binds } = builder(
  select(),
  from("users"),
  where(ops.eq("user_id", value("abc")))
).serialize();
```

But I've since decided that this query builder just... _isn't_ what I want. It works _great_ for large queries (which was my original purpose), and
it has a nice, immutable API, but something felt missing. You see, I didn't just want a full query builder, I wanted an API that
could be used as a base for a full ORM and a set of related tools. The first version of fragmentum didn't cut the mustard.

With that in mind, and after a few months of thought, I went back to the drawing board. Here's what I drew:

```js
let getById = where(ops.eq(arg("primaryKey"), arg("id", id => escape(id))));

let getUserById = fragment(
  select(),
  from("users"),
  getById({
    primaryKey: "user_id"
  })
);

let getUser123 = getUserById({
  id: 123
});

let { query, binds } = execute(getUser123);
```

Let's break this down. Most things seem pretty similar: `builder` became `fragment`, `.serialize` became `execute()`
, and the structure of the `where` fragment is almost identical. But there's two key differences:

- The result of the `where` clause is being called as a function
- There's something called `arg()` that seems to correspond with each key in the function call.

And that is where the true difference lies. Fragments are no longer objects, they're functions! `arg()` denotes an argument to the function. However, there's some
key differences between fragments and normal JS functions:

- Fragments _always_ have named arguments.
- Fragment arguments are automatically curried.

Let's revisit the above example. `getById` is a fragment with two arguments: `primaryKey` and `id`. We use that fragment to create
a larger `getUserById` fragment, and in the process fill in the `primaryKey` argument to `getById`. However, the `id` argument still hasn't been filled in, so it
still exists on the `getUserById` fragment. Finally, we supply the `id` argument, and create a `getUser123` fragment. That 2nd argument to the `arg("id")` function is
called, and we escape the ID. We then execute that fragment, and get the regular query string back.

That's the idea behind fragmentum. Fragments, that are really functions, that fill in "holes" in some kind of SQL statement.

Once again, these things are 100% immutable, which means you can do something cool like the following:

```js
// my-rest-api.js

// Same thing as above, for reference
let getUserById = fragment(
  select(),
  from("users"),
  getById({
    primaryKey: "user_id"
  })
);

app.get("/user/:id", async req => {
  let { query, binds } = execute(getUserById({ id: req.params.id }));
  let user = await someSQLLibraryLikeKnex.query(query, {
    binds
  });
  return user;
});
```

We defined the query _outside_ of the endpoint, and then leveraged it's immutability so that we only fill in the `id` argument
in the path handler proper.

### What does this enable?

Let's find out! Let's build a lightweight ORM using these principles:

```js
let Model = ({ table, primaryKey = "id" }) => ({
  getById: fragment(
    getById({
      primaryKey: column(table, primaryKey)
    }),
    from(table)
  ),
  query: from(table)
});
```

Now let's create a model with this simple ORM

```js
let User = Model({
  table: "users"
});
```

And finally, let's actually run a query using this model:

```js
let user123Query = execute(fragment(
  select('*'), // If we're doing a SELECT *, this can just be select()
  User.getById({ id: 123 })
);
```

It looks a little annoying. Why can't we just call `User.getById`? We could, except we avoided setting any columns during the
model definition. That means we still have to specify what columns we want.

Still not feeling comfortable? I get it. It can be pretty weird. Let's try wrapping it up:

```js
let getCompleteRecord = fragment(
  select(),
  /**
   * Remember, the 2nd argument to `arg` will be called with whatever the user passes in, and we can manipulate it if need be.
   */
  arg("model", model => model.getById)
);
```

```js
let user123Query = execute(
  getCompleteRecord({
    model: User,
    id: 123
  })
);
```

Look better?

So what do you think? I'd really appreciate any feedback anyone has. I haven't started implementing this API at all yet, but I definitely think it's possible.

If you want to leave feedback on it (PLEASE DO), DM me on [twitter](https://twitter.com/lincolnnathan21), or email me at nate.school42@gmail.com
