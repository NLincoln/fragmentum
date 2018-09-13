/**
 * This is really just a basic test that we can provide some values as the top-level args
 *
 * This notion of "top-level args" isn't really useful as far as the user-facing api goes,
 * but I'm thinking it can make cases like subqueries much easier.
 */

import { execute, fragment, arg } from "fragmentum";

test("providing top-level-args", () => {
  let table = fragment(arg("table"));
  let { query } = execute(table, {
    table: "users"
  });
  expect(query).toEqual("users");
});
