import { fragment, select, from, execute, arg } from "fragmentum";
const table = from(arg("table"));

test("a simple select statement", () => {
  let getUsers = fragment(select("*"), from("users"));

  let { query, binds } = execute(getUsers);

  expect(query).toBe("SELECT * FROM `users`");
  expect(binds).toEqual({});
});

test("a simple arg", () => {
  let getTable = fragment(select("*"), table);
  let { query, binds } = execute(
    getTable({
      table: "users"
    })
  );
  expect(query).toBe("SELECT * FROM `users`");
  expect(binds).toEqual({});
});

test("two args", () => {
  let getTable = from(arg("table-a"));
  let getTableB = from(arg("table-b"));
  let frag = fragment(getTable, getTableB);
  let { query } = execute(
    frag({
      "table-b": "other_users"
    })({
      "table-a": "users"
    })
  );
  expect(query).toEqual("FROM `users` FROM `other_users`");
});

test("egregiously wrapping in fragment()", () => {
  let getTable = fragment(select("*"), table);
  getTable = fragment(fragment(fragment(fragment(getTable))));
  getTable = fragment(
    fragment(
      fragment(
        getTable({
          table: "users"
        })
      )
    )
  );
  let { query } = execute(getTable);
  expect(query).toBe("SELECT * FROM `users`");
});

test("multiple levels of args", () => {
  let getUser = table({
    table: arg("other-table")
  });

  let getAll = fragment(select("*"), getUser);
  let { query } = execute(
    getAll({
      "other-table": "users",
      table: "not_users"
    })
  );
  expect(query).toBe("SELECT * FROM `users`");
});
