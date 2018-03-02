import {
  builder,
  select,
  from,
  where,
  groupBy,
  having,
  join,
  limit,
  orderBy,
  ops,
  agg,
  rawValue
} from "fragmentum";
import { testQuery } from "./util";

const overridableTest = (
  name,
  defaultFragment,
  defaultExpected,
  fragment,
  expected
) => {
  describe(name, () => {
    testQuery(
      "providing just the default",
      () => builder(defaultFragment.overridable()),
      defaultExpected
    );
    testQuery(
      "providing an override",
      () => builder(defaultFragment.overridable(), fragment),
      expected
    );
  });
};

describe("overridable fragments", () => {
  overridableTest("select", select(), `SELECT *`, select("id"), `SELECT "id"`);
  overridableTest(
    "from",
    from("default"),
    `FROM "default"`,
    from("main"),
    `FROM "main"`
  );
  overridableTest(
    "where",
    where(ops.eq("id", "user")),
    `WHERE ("id" = "user")`,
    where(ops.eq("user", "id2")),
    `WHERE ("user" = "id2")`
  );
  overridableTest(
    "group-by",
    groupBy("column"),
    `GROUP BY "column"`,
    groupBy("othercolumn"),
    `GROUP BY "othercolumn"`
  );
  overridableTest(
    "having",
    having(ops.gt(agg.count(), rawValue(5))),
    `HAVING (COUNT(*) > '5')`,
    having(ops.lt(agg.count("column"), rawValue(2))),
    `HAVING (COUNT("column") < '2')`
  );
  overridableTest(
    "order-by",
    orderBy("id"),
    `ORDER BY "id" ASC`,
    orderBy("notId"),
    `ORDER BY "notId" ASC`
  );
  overridableTest(
    "join",
    join("users", "user.id", "group.user_id"),
    `INNER JOIN "users" ON ("user"."id" = "group"."user_id")`,
    join("friends", "friend.id", "friend.foo"),
    `INNER JOIN "friends" ON ("friend"."id" = "friend"."foo")`
  );
  overridableTest(
    "limit/offset",
    limit(rawValue(5)),
    `LIMIT '5'`,
    limit(rawValue(10)),
    `LIMIT '10'`
  );
});
