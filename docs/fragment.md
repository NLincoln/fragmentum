Collects a bunch of other fragments into one.

```js
let getUserTable = fragment(
  select("id"),
  select("user_id", "email"),
  from("users")
);
```

Fragments can also consume other fragmnents. The following is equivalent to the above:

```js
fragment(
  fragment(select("id")),
  fragment(select("user_id", "email"), from("users"))
);
```

# `createFragment`

Fragmentum allows you to create your own fragments.

WARNING: This is a super low-level API, and I don't anticipate you'll need to use it too much. Please, if you encounter
an issue for which you think you need `createFragment`, please, please open an issue on github first. No guarantees that I'll
put your use-case into `fragmentum`'s core, but I want to get a good understanding of what use-case people might have for this primitive.

Without further ado, here is how to create custom fragments, as well as some explanation of the fragmentum internals.

## example: `SPECIAL_COUNTER`

Let's look at a small example: Adding a `SPECIAL_COUNTER(...args)` fragment

This fragment would be used like this:

```js
execute(fragment(specialCounter(arg("counter")), select(), from("users")), {
  counter: "counterID"
});
```

Resulting in:

```sql
SELECT * SPECIAL_COUNTER(`counterID`) FROM `users`
```

Meaning we need to accept some kind of args, and be able to be ordered and grouped.

One implementation of this fragment would be the following:

```js
/**
 * `ident` allows your fragment to be grouped together with other fragments.
 * We create ONLY ONE symbol, otherwise the grouping behavior won't work.
 */
let IDENT = Symbol("special-counter");
/**
 * This is the function invoked when building your SQL query.
 */
let specialCounter = id => {
  /**
   * createFragment accepts one argument, the "repr" function.
   * The repr function is invoked during the first pass at serialization, when all the args were resolved.
   */
  return createFragment(args => {
    /**
     * At this point, we're in the "repr" phase of building the query.
     * At this moment, the `execute` function has been called, and all of the args
     * have been provided to our fragment
     */
    /**
     * In order to resolve any args & escape any strings, call `execute` on any value with the args we have here
     * I think of this as "forwarding" the args
     */
    id = execute(id, args).query;

    /**
     * There are only 2 required values on the result of the repr function:
     * - an `ident` that uniquely identifies this fragment type
     * - a `serialize` function that returns the fragment in string form.
     *
     * Optional results are:
     * - `ordering`: a number that defines where this fragment belongs in a serialized query.
     * - `wrap`: Wraps the result of calling `serialize` together on multiple fragments
     * - `combine`: combines multiple instances of `serialize`
     */
    return {
      id,
      ident: IDENT,
      /**
       * Since select has an ordering of 10, and from has an ordering of 20, 15 will put `SPECIAL_COUNTER` between them
       */
      ordering: 15,
      serialize(repr) {
        return `SPECIAL_COUNTER(${repr.id})`;
      }
    };
  });
};
```
