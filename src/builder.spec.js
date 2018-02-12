import { select, from, where, eq, value, Builder } from "./builder";

const testQuery = (name, query, expected) =>
  test(name, () => {
    expect(query.serialize()).toEqual(expected);
  });

describe("select statements", () => {
  testQuery(
    "basic select",
    new Builder([select(), from("users")]),
    `SELECT * FROM "users";`
  );
  testQuery(
    "with where clause",
    new Builder([select(), from("users"), where(eq("user_id", value(1)))]),
    `SELECT * FROM "users" WHERE "user_id" = '1';`
  );
  testQuery(
    "with columns",
    new Builder([select("id", "username"), from("users")]),
    `SELECT "id", "username" FROM "users";`
  );
  testQuery(
    "columns + where",
    new Builder([
      select("id", "username"),
      from("users"),
      where(eq("id", value(2)))
    ]),
    `SELECT "id", "username" FROM "users" WHERE "id" = '2';`
  );
});

describe.skip("", () => {});
