# What am I looking at?

The basic architecture of fragmentum goes as follows:

- The only public API the user can access is a bunch of functions.
- We use properties set on the functions to carry our internal state throughout the code

Let's look at the symbols:

### `FRAG`

All the current "methods" of the fragment. Right now, this is only `serialize`, and I don't anticipate that changing.

`serialize` is really simple. It receives the current args of it's fragment, and it needs to return a hash looking like the following:

```ts
interface Serialized {
  query: string;
  binds: { [x: string]: string };
}
```

It is the responsibility of the current fragment to serialize any child fragments. Usually this is done by calling `.serialize()` on them, recursively.

More about the details of this function in a bit.

### `ARGUMENT`

Denotes this object as an argument. The interface of arguments looks like the following:

```ts
interface Argument {
  [Symbol()]: true;
  name: string;
  transducer: <T, U>(val: T) => U;
}
```

### `CURRENT_ARGS` & the details of `.serialize()`

Any arguments that were applied to create this fragment. These only exist on the level that the args were applied on.

To illustrate how this property works, let's look at an example: (please note that this is merely _conceptual_, none of this code would work normally)

```js
/**
 * No args were applied at the level of baseFragment, so CURRENT_ARGS here is {}
 */
let baseFragment = from(arg("table"));

/**
 * At this level, we supply a set of arguments. CURRENT_ARGS here is { table: 'users' };
 */
let userFragment = baseFragment({
  table: "users"
});

/**
 * Here's what's important: NO args were used to create wrappedFragment, so CURRENT_ARGS here goes back to {};
 */
let wrappedFragment = fragment(userFragment);
```

So does that mean that the arguments were lost when we wrapped `userFragment` to create `wrappedFragment`? No!
The arguments still exist inside of the `userFragment` closure. Here's a visualization of what happens when we execute
`wrappedFragment`:

```js
execute(wrappedFragment);
// Conceptually, this evaluates to something like:

wrappedFragment.serialize();

// Expanding to:

userFragment.serialize({
  table: 'users'
});

// Notice how we add the args at this layer. We will come back to that after this code snippet

baseFragment.serialize({
  table: 'users'
})

/**
 * Here we see how args are passed down: they are passed down via the `serialize` methods.
 */

from(arg('table')).serialize({
  table: 'users'
})

// Which, finally, serializes to:

{
  query: 'FROM `users`',
  binds: {}
}
```

ALRIGHT HOLD UP FAM THIS IS IMPORTANT

notice how the arguments were supplied _to_ `userFragment.serialize()`, instead of
expanding another level and having `userFragment` supply the args to `baseFragment`,
the _arguments are provided to userFragment_.

This seems counterintuitive, but it doesn't matter in practice (hence why this is in an internals doc instead of api docs)
The reason for this is because when you're creating a new fragment by supplying args, you can't _add_ any new args.

What I mean by this is that adding a new `arg()` and also supplying the value of that `arg` in a single step is
impossible. You might think of something like:

```js
fragment(arg("foo"))({ foo: "bar" });
```

But that's just two steps, disguised as one:

```js
let _foo = fragment(arg("foo"));
_foo({ foo: "bar" });
```
