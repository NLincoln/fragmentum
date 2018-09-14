# `execute`

Execute properly serializes your fragment into a string.

```js
let getUsers = fragment(select("id"), from("users"));

let { query } = execute(getUsers);
```

Additionally, `execute` can accept a set of initial arguments.
I really don't recommend you use this feature, as I'm thinking about removing it (you can easily call the fragment function)
but it can be useful when defining your own fragments, so I'll leave it.

```js
let getTable = fragment(from(arg("table")));

let { query } = execute(getTable, {
  table: "users"
});
```

Mostly, though, you want to use this in the scenario where you're writing a custom fragment, and you need to serialize
a subquery.

```js
import { createFragment, isFragment, execute } from "fragmentum";
let customFragment = (...fields) =>
  createFragment(args => {
    return {
      serialize() {
        return fields.map(field => {
          if (isFragment(field)) {
            return execute(field, args);
          }
        });
      }
    };
  });
```
