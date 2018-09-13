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

### the details of `.serialize()`

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

userFragment.serialize();

// Now, finally, we apply the args

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

# Dealing with multiple select() statements

So basically, I want to write the following:

```js
fragment(select("user_id"), fragment(select("username")));
```

And have all of that "just work"

But as it turns out that's pretty difficult with the current architecture, so I'm trying to figure some stuff out.

So right now we zig-zag all around the tree of data. I'm considering making a two-pass system or something. The JS above
constructs a "lightweight" representation of the query tree. This pass is all about resolving the arguments, to the degree that
the returned value from this pass will have all values properly resolved.

After sleeping on it, I'm fully convinced of the 2-pass system. First pass has each fragment return a lightweight representation of
what they need, including how to "really" serialize themselves. The first pass also resolves all _arg_ clauses.

Pass 2 goes through the entire tree of fragments, and serializes them all into a string.

### 2-pass implementation

I'm considering making the first pass just grabbing every fragments `FRAG` symbol... but I worry that we'll lose closure data that
way. Let's back up then. What would the interface look like?

```js
interface Repr {
  type: symbol;
  wrap?: (x: string) => string;
  combine?: (xs: string[]) => string;
  // Can attach any other info onto this, above stuff is just for
  //  the parent executor to understand.
  [x: string]: any;
}

createFragment({
  type: types.select,
  // repr in this case means "some lightweight representation"
  repr: (args: ArgsMap) => Repr

  serialize: (repr) => {
    // returns a { query, binds } tuple, argument is whatever is returned from resolve()
  }
});
```

In theory this architecture should allow us to handle situations like the following:

```js
fragment(select("user_id"), fragment(select("username")));
```
