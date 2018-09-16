`func` is a lot like `ops`, in that fragmentum provides a small list of premade functions, as well as a utility
for creating custom functions. Also like `ops`, the underlying api is based on `createFragment`, so if you need something custom,
you can :)

# Calling Functions:

```js
fragment(func.count("*"), from("users")); // COUNT(*) FROM `users`;
```

The list of premade functions is:

- `func.count`
- `func.avg`
- `func.concat`

# Creating custom functions

You can create custom functions with the `createFunc` function:

```js
let trim = createFunc({
  name: "TRIM"
});

fragment(select(trim(value("  a  ")))); // 'SELECT TRIM('  a  ')
```
