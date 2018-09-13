import { select, execute, fragment, arg } from "fragmentum";

test("basic select", () => {
  let { query } = execute(select("id"));
  expect(query).toEqual("`id`");
});

test("with a table name", () => {
  let { query } = execute(select("users.id"));
  expect(query).toEqual("`users`.`id`");
});

test("multiple columns", () => {
  let { query } = execute(select("users.id", "id"));
  expect(query).toEqual("`users`.`id`, `id`");
});

test("wrapping in a fragment causes SELECT to be added on", () => {
  let { query } = execute(fragment(select("users.id")));
  expect(query).toEqual("SELECT `users`.`id`");
});

test("de-duping selects at the same level", () => {
  let { query } = execute(fragment(select("id"), fragment(select("users.id"))));
  expect(query).toEqual("SELECT `id`, `users`.`id`");
});
