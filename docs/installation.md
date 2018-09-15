---
id: installation
title: Installation
sidebar_label: Getting started
---

You can install fragmentum with:

```sh
$ yarn add fragmentum
```

Fragmentum, currently, does not expose `.mjs` files. If you need these, open an issue.
That said, if you use a bundler, es imports will work:

```js
import { fragment, execute } from "fragmentum";
```

CommonJS is also supported

```js
const { fragment, execute } = require("fragmentum");
```

All functions come from the `fragmentum` module. There are no other entry points to the module, and the entire library is bundled
with `rollup`.
