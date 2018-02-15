import { builder, where, ops, bind } from "fragmentum";
import { testQuery } from "./util";

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
