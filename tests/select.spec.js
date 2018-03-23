import { builder, select, ops, rawValue, window, agg } from "fragmentum";
import { testQuery } from "./util";

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
      .where(ops.eq("user_id", rawValue(1))),
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
      .where(ops.eq("id", rawValue(2))),
    `SELECT "id", "username" FROM "users" WHERE ("id" = '2');`
  );
});

describe("window functions", () => {
  testQuery(
    "other basic over clause",
    () => builder(select(agg.count().over())),
    `SELECT COUNT(*) OVER ()`
  );
  testQuery(
    "with partition",
    () =>
      builder(
        select(
          agg
            .count()
            .over()
            .partition("group")
        )
      ),
    `SELECT COUNT(*) OVER (PARTITION BY "group")`
  );
  testQuery(
    "with partition and order by",
    () =>
      builder(
        select(
          agg
            .count()
            .over()
            .partition("group")
            .orderBy("username")
        )
      ),
    `SELECT COUNT(*) OVER (PARTITION BY "group" ORDER BY "username" ASC)`
  );
  testQuery(
    "selecting a subquery with an alias",
    () =>
      builder(
        select(
          builder()
            .setAlias("alias")
            .select("id")
            .from("users")
            .where(ops.eq("id", rawValue("2")))
        )
      ),
    `SELECT (SELECT "id" FROM "users" WHERE ("id" = '2')) AS "alias"`
  );
});
