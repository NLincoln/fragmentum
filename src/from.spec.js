import { execute, fragment, from, select, arg } from "fragmentum";

test("basic from statement", () => {
  let { query } = execute(from("users"));
  expect(query).toEqual("`users`");
});

test("with an arg", () => {
  let { query } = execute(
    from(arg("table"))({
      table: "users"
    })
  );
  expect(query).toEqual("`users`");
});

test("wrapping it in some FRAGMENT", () => {
  let { query } = execute(fragment(from("users")));

  expect(query).toEqual("FROM `users`");
});

test("combining multiple levels together (cross joins basically)", () => {
  let { query } = execute(fragment(from("users"), fragment(from("groups"))));
  expect(query).toEqual("FROM `users`, `groups`");
});

test("renaming args with tables", () => {
  let getTable = from(arg("table"));

  let getTwoTables = fragment(
    getTable({
      table: arg("first-table")
    }),
    getTable({
      table: arg("second-table")
    })
  );

  let { query } = execute(
    getTwoTables({
      "first-table": "users",
      "second-table": "other-users"
    })
  );

  expect(query).toEqual("FROM `users`, `other-users`");
});

[
  [null, "null"],
  [Symbol(), "symbol"],
  [{}, "object"],
  [12312313, "number"],
  [[], "array"]
].forEach(([val, desc]) => {
  test("bad input " + desc, () => {
    expect(() => {
      from(val);
    }).toThrowError();
  });
});
