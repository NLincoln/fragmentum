---
id: the-new-api
title: New Stuff
sidebar_label: The New API
---

Old Fragmentum was great, but it tried too much to be like "traditional" query builders. However, after taking a step back for awhile, 
I have some ideas.

Let's look at what defining a fragment looks like now:

```js
let getById = where(ops.eq(arg('primaryKey'), arg('id')))
// OR
let getById = fragment(
  where(ops.eq(arg('primaryKey'), arg('id')))
)
```

Looks pretty similar to the old api, right? Except it's completely different. 
Instead of being a "fragment" object, `getById` is a _function_. It accepts a hash
of arguments, each value in the hash corresponding to one of the `arg()`s

So we can do something like the following:

```js
let getUserById = fragment(
  select(),
  from('users'),
  getById({
    primaryKey: 'user_id',
  })
)
```

but this isn't executable yet. For that, you have to do something like

```js
let { query, binds } = execute(getUserById({
  id: 123
}))
```

### Ok but why all the function calling?

Think of fragments as curried functions with certain arguments. The details of how the query is implemented is opaque to the caller, and
the user of the fragment can fill in values as much as they like. 


### What does this enable?

Let's find out! Let's build a lightweight ORM using these principles:

```js
let Model = ({ table, primaryKey = 'id' }) => ({
  getById: fragment(
    getById({
      primaryKey: column(table, primaryKey),
    }),
    from(table)
  ),
  query: from(table)
})
```

Now let's create a model with this simple ORM

```js
let User = Model({
  table: 'users',
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
  arg('model', (model) => model.getById)
)
```

Hold up. What's that function doing with `arg`? That's the _transducer_ argument. When the argument `model` is received, we call that function, and use the result of it as the _real_ value of the arg under the hood. 

```js
let user123Query = execute(getCompleteRecord({
  model: User,
  id: 123
}));
```

Look better?

So what do you think? I'd really appreciate any feedback anyone has. I haven't started implementing this API at all yet, but I definitely think it's possible. 

If you want to leave feedback on it (PLEASE DO), DM me on [twitter](https://twitter.com/lincolnnathan21), or email me at nate.school42@gmail.com
