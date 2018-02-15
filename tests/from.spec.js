import { builder } from "fragmentum";
import { testQuery } from "./util";

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
