import { select, eq, value } from "./builder";

const testQuery = (name: string, query: object, expected: string) =>
  test(name, () => {
    expect(query.toString()).toEqual(expected);
  });

describe("select statements", () => {
  testQuery("basic select", select().from("users"), `SELECT * FROM "users";`);
  testQuery(
    "with where clause",
    select()
      .from("users")
      .where(eq("user_id", value(1))),
    `SELECT * FROM "users" WHERE "user_id" = '1';`
  );
  testQuery(
    "with columns",
    select("id", "username").from("users"),
    `SELECT "id", "username" FROM "users";`
  );
  testQuery(
    "columns + where",
    select("id", "username")
      .from("users")
      .where(eq("id", value(2))),
    `SELECT "id", "username" FROM "users" WHERE "id" = '2';`
  );
});
