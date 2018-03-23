---
id: installation
title: Installation
sidebar_label: Installation
---

```sh
$ yarn add fragmentum
```

Or, for NPM users:
```sh
$ npm install fragmentum --save
```

Fragmentum supports Node >= 6.

# Usage
Fragmentum is packaged as a single, rolled-up commonjs bundle. Importing from anything but `fragmentum` is unsupported.

```js
import { builder } from 'fragmentum';
```
Or, for commonjs
```js
const { builder } = require('fragmentum');
```
