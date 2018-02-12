import { select, from, where, eq, value, builder, bind } from "./builder";

const testQuery = (name, query, expected) =>
  test(name, () => {
    const sql = query.serialize();

    if (!expected) {
      expect(sql).toMatchSnapshot();
    } else {
      expect(sql.query).toEqual(expected);
    }
  });

describe("builder", () => {
  testQuery(
    "concat-ing from another builder",
    builder(builder().select(), builder().from("users")),
    `SELECT * FROM "users";`
  );
  test("list of fragments", () => {
    const sql = builder(select("user"), from("users")).serialize();
    expect(sql).toMatchSnapshot();
  });
  test("method chaining", () => {
    const sql = builder()
      .select("user")
      .from("users")
      .serialize();
    expect(sql).toMatchSnapshot();
  });
  test("a healthy mix", () => {
    expect(
      builder(select())
        .from("users")
        .serialize()
    ).toMatchSnapshot();
  });
});

describe("select statements", () => {
  describe("column alias", () => {
    testQuery(
      "with array",
      builder()
        .select(["username", "name"])
        .from("users"),
      `SELECT "username" AS "name" FROM "users";`
    );
    testQuery(
      "with object",
      builder()
        .select({
          username: "name"
        })
        .from("users"),
      `SELECT "username" AS "name" FROM "users";`
    );
    testQuery(
      "conditional array",
      builder()
        .select(["username", false])
        .from("users"),
      `SELECT "username" FROM "users";`
    );
    testQuery(
      "conditional object",
      builder()
        .select({
          username: false
        })
        .from("users"),
      `SELECT "username" FROM "users";`
    );
  });
  testQuery(
    "wildcard + named columns",
    builder()
      .select()
      .select("username")
      .from("users"),
    `SELECT *, "username" FROM "users";`
  );
  testQuery(
    "multiple select fragments",
    builder()
      .select("id")
      .select("username")
      .from("users"),
    `SELECT "id", "username" FROM "users";`
  );
  testQuery(
    "basic select",
    builder()
      .select()
      .from("users"),
    `SELECT * FROM "users";`
  );
  testQuery(
    "with where clause",
    builder()
      .select()
      .from("users")
      .where(eq("user_id", value(1))),
    `SELECT * FROM "users" WHERE "user_id" = '1';`
  );
  testQuery(
    "with columns",
    builder()
      .select("id", "username")
      .from("users"),
    `SELECT "id", "username" FROM "users";`
  );
  testQuery(
    "columns + where",
    builder()
      .select("id", "username")
      .from("users")
      .where(eq("id", value(2))),
    `SELECT "id", "username" FROM "users" WHERE "id" = '2';`
  );
});
// Make sure nothing is accidentally mutated
describe.skip("immutability");

describe("variable binds", () => {
  test("can bind variables", () => {
    const sql = builder(
      select(),
      from("users"),
      where(eq("id", bind("user_id", 3)))
    ).serialize();
    expect(sql).toHaveProperty("binds");
    expect(sql).toHaveProperty("query");
    expect(sql).toMatchSnapshot();
  });
  test.skip("value() will return a bound var with an anonymous key", () => {});
});

describe("conditional fragments", () => {
  testQuery(
    "conditional fragments as part of a builder / concat",
    builder(false, select("users"))
      .from("users")
      .concat(false, select("id")),
    `SELECT "users", "id" FROM "users";`
  );
});

describe.skip("subqueries", () => {
  describe.skip("From <subquery>");
  describe.skip("select <subquery>");
  describe.skip("subquery in expression");
});
describe.skip("custom SQL functions");
describe.skip("from");
describe.skip("join");
describe.skip("where");
describe.skip("having");
describe.skip("group by");
describe.skip("limit/offset");
