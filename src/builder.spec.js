import { select, from, where, ops, value, builder, bind } from "./index";

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
      builder()
        .select("user_id")
        .select({
          username: false
        })
        .from("users"),
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
      .where(ops.eq("user_id", value(1))),
    `SELECT * FROM "users" WHERE ("user_id" = '1');`
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
      .where(ops.eq("id", value(2))),
    `SELECT "id", "username" FROM "users" WHERE ("id" = '2');`
  );
});

describe("variable binds", () => {
  test("can bind variables", () => {
    const sql = builder(
      select(),
      from("users"),
      where(ops.eq("id", bind("user_id", 3)))
    ).serialize();
    expect(sql).toHaveProperty("binds");
    expect(sql).toHaveProperty("query");
    expect(sql).toMatchSnapshot();
  });
  test("value() will return a bound var with an anonymous key");
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
          builder("alias2", where(ops.eq("user.user_id", bind("userid", 2))))
            .select()
            .from("groups")
        )
      ),
      {
        query: `FROM "user", (SELECT * FROM "users") AS "alias", (SELECT * FROM "groups" WHERE ("user"."user_id" = :userid)) AS "alias2"`,
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
  describe("subquery in expression", () => {
    testQuery(
      "subquery inside of expression: full test",
      () =>
        builder(
          select(),
          from("users"),
          where(
            ops.eq(
              "user_id",
              builder(
                "alias",
                select("user_id"),
                from("users"),
                where(ops.eq("group_id", bind("user_id", 2)))
              )
            )
          )
        ),
      `SELECT * FROM "users" WHERE ("user_id" = (SELECT "user_id" FROM "users" WHERE ("group_id" = :user_id)));`
    );
  });
});

// Make sure nothing is accidentally mutated
describe.skip("immutability");

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
describe("binary expressions", () => {
  const binaryOpTest = (func, expected) => {
    describe(`Optests: ${expected}`, () => {
      testQuery(
        "simple string columns",
        () => where(func("a", "b")),
        `("a" ${expected} "b")`
      );
      testQuery("binds", () => where(func("a", bind("userid", 2))), {
        query: `("a" ${expected} :userid)`,
        binds: [
          {
            userid: 2
          }
        ]
      });
      testQuery(
        "nesting",
        () => where(func("a", func("b", "c"))),
        `("a" ${expected} ("b" ${expected} "c"))`
      );
    });
  };
  binaryOpTest(ops.eq, "=");
  binaryOpTest(ops.gt, ">");
  binaryOpTest(ops.lt, "<");
  binaryOpTest(ops.ne, "!=");
  binaryOpTest(ops.gte, ">=");
  binaryOpTest(ops.lte, "<=");
  binaryOpTest(ops.bit.shiftLeft, "<<");
  binaryOpTest(ops.bit.shiftRight, ">>");
  const associativeOpsTest = (func, expected, name = expected) => {
    binaryOpTest(func, expected);
    describe(`Associative OpTests: ${name}`, () => {
      testQuery(
        "providing 3 values",
        () => where(func("id", "di", "d3")),
        `("id" ${expected} "di" ${expected} "d3")`
      );
      testQuery("Providing one value", () => where(func("id")), `("id")`);
    });
  };
  associativeOpsTest(ops.add, "+");
  associativeOpsTest(ops.sub, "-");
  associativeOpsTest(ops.div, "/");
  associativeOpsTest(ops.mult, "*");
  associativeOpsTest(ops.bit.and, "&");
  associativeOpsTest(ops.bit.or, "|");
  associativeOpsTest(ops.bit.xor, "#");
  test("NOT !");
  test("like");
  test("in");
});
describe("join", () => {
  describe("inner joins", () => {
    testQuery(
      "simple inner join",
      () =>
        builder()
          .from("users")
          .join("groups", "user.group_id", "group.user_id"),
      `FROM "users" INNER JOIN "groups" ON ("user"."group_id" = "group"."user_id")`
    );
    testQuery(
      "can provide any expression",
      () => builder().join("groups", ops.eq("user.group_id", "group.user_id")),
      `INNER JOIN "groups" ON ("user"."group_id" = "group"."user_id")`
    );
    testQuery(
      "multiple joins",
      () =>
        builder()
          .join("groups", "user.group_id", "group.user_id")
          .join("products", "product.group_id", "group.id"),
      `INNER JOIN "groups" ON ("user"."group_id" = "group"."user_id") INNER JOIN "products" ON ("product"."group_id" = "group"."id")`
    );
    testQuery(
      "join on a subquery",
      () =>
        builder().join(
          builder("a")
            .select()
            .from("users"),
          "a.user_id",
          "b.id"
        ),
      `INNER JOIN (SELECT * FROM "users") AS "a" ON ("a"."user_id" = "b"."id")`
    );
    testQuery(
      "condition uses a subquery",
      () =>
        builder().join(
          "groups",
          "user.group_id",
          builder(where(ops.eq("user.id", bind("userid", 2))))
            .select()
            .from("users")
        ),
      `INNER JOIN "groups" ON ("user"."group_id" = (SELECT * FROM "users" WHERE ("user"."id" = :userid)))`
    );
  });
});
describe.skip("where");
describe.skip("having");
describe.skip("group by");
describe.skip("limit/offset");
