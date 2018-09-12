import { builder, where, ops, bind, select, from } from "fragmentum";
import { testQuery } from "./util";

describe("subqueries", () => {
  describe("From <subquery>", () => {
    testQuery(
      "from a builder",
      builder().from(
        builder()
          .setAlias("alias")
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
            builder()
              .setAlias("alias")
              .select()
              .from("users")
          )
        ),
        from(
          builder(where(ops.eq("user.user_id", bind("userid", 2))))
            .setAlias("alias2")
            .select()
            .from("groups")
        )
      ),
      {
        query: `FROM "user", (SELECT * FROM "users") AS "alias", (SELECT * FROM "groups" WHERE ("user"."user_id" = :userid)) AS "alias2"`,
        binds: {
          userid: 2
        }
      }
    );

    testQuery(
      "from an incomplete fragment",
      builder(from(builder(select()).setAlias("alias"))),
      `FROM (SELECT *) AS "alias"`
    );

    testQuery(
      "from another from fragment",
      builder()
        .select("alias.user_id")
        .from(
          from(
            builder(select())
              .setAlias("alias")
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
  testQuery(
    "passing in a default alias",
    () =>
      builder(
        from(
          builder()
            .select()
            .from("users")
            .softAlias("defaultAlias")
        ),
        from(
          builder()
            .setAlias("setAlias")
            .select()
            .from("users")
            .softAlias("otherDefaultAlias")
        ),
        from(
          builder()
            .from("users")
            .softAlias("otherDefaultAlias")
            .softAlias("defaultAlias")
        )
      ),
    `FROM (SELECT * FROM "users") AS "defaultAlias", (SELECT * FROM "users") AS "setAlias", (FROM "users") AS "otherDefaultAlias"`
  );
  testQuery(
    "not providing a name",
    builder(
      from(
        builder()
          .select()
          .from("users")
      )
    )
  );
});