import { builder, cast, ops } from "fragmentum";

import { testQuery } from "./util";

describe("type casts", () => {
  testQuery(
    "wrapping an expression",
    cast("foobar", "INT"),
    `CAST("foobar" AS INT)`
  );
  testQuery(
    "calling cast on an expression",
    ops.eq("id", "foobar").cast("INT"),
    `CAST(("id" = "foobar") AS INT)`
  );
  testQuery(
    "selecting a cast",
    builder().select(cast("id", "INT")),
    `SELECT CAST("id" AS INT)`
  );
});
