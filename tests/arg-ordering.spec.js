import { fragment, execute, arg } from "fragmentum";
const table = fragment(arg("table"));

test("value provided immediately", () => {
  let getUsers = fragment(table({ table: "users" }));

  let { query, binds } = execute(getUsers);

  expect(query).toBe("users");
  expect(binds).toEqual({});
});

test("wrapped in a fragment first", () => {
  let getTable = fragment(table);
  let { query, binds } = execute(
    getTable({
      table: "users"
    })
  );
  expect(query).toBe("users");
  expect(binds).toEqual({});
});

test("two args", () => {
  let getTable = fragment(arg("table-a"));
  let getTableB = fragment(arg("table-b"));
  let frag = fragment(getTable, getTableB);
  let { query } = execute(
    frag({
      "table-b": "other_users"
    })({
      "table-a": "users"
    })
  );
  expect(query).toEqual("users other_users");
});

test("egregiously wrapping in fragment()", () => {
  let getTable = fragment(table);
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
  expect(query).toBe("users");
});

test("multiple levels of args", () => {
  let getUser = table({
    table: arg("other-table")
  });

  let getAll = fragment(getUser);
  let { query } = execute(
    getAll({
      "other-table": "users",
      table: "not_users"
    })
  );
  expect(query).toBe("users");
});
