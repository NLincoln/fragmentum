import { testQuery } from "./util";
import { builder, orderBy } from "fragmentum";

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
    `"users"."id" ASC, "groups"."id" DESC`
  );
});
