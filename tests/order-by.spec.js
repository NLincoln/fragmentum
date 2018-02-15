import { testQuery } from "./util";
import { builder, orderBy, limit } from "fragmentum";

describe("ORDER-BY", () => {
  testQuery(
    "basic order-by, use defaults",
    () => orderBy("users.id"),
    `"users"."id" ASC`
  );
  testQuery(
    "specify which one we want",
    () => orderBy(["users.id", "DESC"]),
    `"users"."id" DESC`
  );
  testQuery(
    "specify multiple",
    () => orderBy(["users.id"], ["groups.id", "DESC"], "projects.id"),
    `"users"."id" ASC, "groups"."id" DESC, "projects"."id" ASC`
  );
  testQuery(
    "inside a builder",
    () => builder(orderBy(["users.id"])).orderBy(["groups.id", "DESC"]),
    `ORDER BY "users"."id" ASC, "groups"."id" DESC`
  );
  testQuery(
    "it comes at the right place in a query",
    builder(orderBy("id"), limit(19)),
    `ORDER BY "id" ASC LIMIT 19`
  );
});
