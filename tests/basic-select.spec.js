const { fragment, select, from, execute, arg } = require("fragmentum");

test("a simple select statement", () => {
  let getUsers = fragment(select("*"), from("users"));

  let { query, binds } = execute(getUsers);

  expect(query).toBe("SELECT * FROM `users`");
  expect(binds).toEqual({});
});

test("a simple arg", () => {
  let getTable = fragment(select("*"), from(arg("table")));
  let { query, binds } = execute(
    getTable({
      table: "users"
    })
  );
  expect(query).toBe("SELECT * FROM `users`");
  expect(binds).toEqual({});
});

test("egregiously wrapping in fragment()", () => {
  let getTable = fragment(select("*"), from(arg("table")));
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
  let getTable = fragment(from(arg("table")));
  let getUser = getTable({
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
