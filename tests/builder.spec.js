import { builder, select, from, where, ops, value } from "fragmentum";
import { testQuery } from "./util";

describe("builder", () => {
  testQuery(
    "concat-ing from another builder",
    builder(builder().select(), builder().from("users")),
    `SELECT * FROM "users";`
  );
  testQuery("list of fragments", builder(select("user"), from("users")));
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

describe("conditional fragments", () => {
  testQuery(
    "conditional fragments as part of a builder / concat",
    builder(false, select("users"))
      .from("users")
      .concat(false, select("id")),
    `SELECT "users", "id" FROM "users";`
  );
  testQuery(
    "conditional parts of an expression",
    builder(select(), from("users"), where(false)),
    `SELECT * FROM "users";`
  );
});
describe("Serializing just fragments", () => {
  testQuery(
    "omitting the select portion",
    builder(from("users")),
    `FROM "users"`
  );
  testQuery("omitting the from portion", builder(select()), "SELECT *");
  test("select", () => {
    expect(select().serialize()).toEqual("*");
  });
  testQuery("from", from("users"), `"users"`);
  test("where", () => {
    expect(where(ops.eq("username", value(2))).serialize().query).toEqual(
      `("username" = '2')`
    );
  });
});

testQuery(
  "table.column syntax",
  builder().select(
    "user.*",
    "user.username",
    "groups.groupname",
    "user.id",
    ["user.first_name", "first"],
    {
      "user.last_name": "last"
    }
  ),
  `SELECT "user".*, "user"."username", "groups"."groupname", "user"."id", "user"."first_name" AS "first", "user"."last_name" AS "last"`
);
describe.skip("where");
describe.skip("having");
describe.skip("group by");
describe.skip("limit/offset");
describe.skip("immutability");
describe.skip("custom SQL functions");
describe.skip("SQL functions");
