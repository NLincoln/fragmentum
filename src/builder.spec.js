import { select, from, where, eq, value, builder, bind } from "./builder";

const testQuery = (name, query, expected) =>
  test(name, () => {
    if (typeof query === "function") {
      query = query();
    }
    const sql = query.serialize();
    if (!expected) {
      expect(sql).toMatchSnapshot();
    } else if (typeof expected === "object") {
      expect(sql).toEqual(expected);
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
        .select("user_id")
        .select(["username", false])
        .from("users"),
      `SELECT "user_id" FROM "users";`
    );
    testQuery(
      "conditional object",
      () => {
        return builder()
          .select("user_id")
          .select({
            username: false
          })
          .from("users");
      },
      `SELECT "user_id" FROM "users";`
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
    expect(where(eq("username", value(2))).serialize().query).toEqual(
      `"username" = '2'`
    );
  });
});

testQuery(
  "table.column syntax",
  builder().select(
    "user.username",
    "groups.groupname",
    "user.id",
    ["user.first_name", "first"],
    {
      "user.last_name": "last"
    }
  ),
  `SELECT "user"."username", "groups"."groupname", "user"."id", "user"."first_name" AS "first", "user"."last_name" AS "last"`
);

describe("subqueries", () => {
  describe("From <subquery>", () => {
    testQuery(
      "from a builder",
      builder().from(
        builder("alias")
          .select()
          .from("users")
      ),
      `FROM (SELECT * FROM "users") AS "alias"`
    );
    testQuery(
      "a garden mix of everything because I'm evil",
      builder(
        from(
          from(
            "user",
            builder("alias")
              .select()
              .from("users")
          )
        ),
        from(
          builder("alias2", where(eq("user.user_id", bind("userid", 2))))
            .select()
            .from("groups")
        )
      ),
      {
        query: `FROM (SELECT * FROM "users") AS "alias", "user", (SELECT * FROM "groups" WHERE "user"."user_id" = :userid) AS "alias2"`,
        binds: [
          {
            userid: 2
          }
        ]
      }
    );

    testQuery(
      "from an incomplete fragment",
      builder(from(builder("alias", select()))),
      `FROM (SELECT *) AS "alias"`
    );

    testQuery(
      "from another from fragment",
      builder()
        .select("alias.user_id")
        .from(
          from(
            builder("alias", select())
              .from("users")
              .from("groups")
          )
        ),
      `SELECT "alias"."user_id" FROM (SELECT * FROM "users", "groups") AS "alias";`
    );
  });
  describe.skip("select <subquery>");
  describe.skip("subquery in expression");
});
describe.skip("custom SQL functions");
describe("from", () => {
  testQuery(
    "cartesian product, one from",
    builder().from("users", "groups"),
    'FROM "users", "groups"'
  );
  testQuery(
    "cartesian product, two from's",
    builder()
      .from("users")
      .from("groups"),
    'FROM "users", "groups"'
  );
});
describe.skip("join");
describe.skip("where");
describe.skip("having");
describe.skip("group by");
describe.skip("limit/offset");
