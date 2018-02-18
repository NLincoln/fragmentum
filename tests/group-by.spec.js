import { builder, groupBy } from "fragmentum";
import { testQuery } from "./util";

describe("group by", () => {
  testQuery(
    "simple",
    () =>
      builder()
        .select()
        .from("users")
        .groupBy("group"),
    `SELECT * FROM "users" GROUP BY "group";`
  );
  testQuery(
    "multiple columns",
    () => builder().groupBy("group", "other.group"),
    `GROUP BY "group", "other"."group"`
  );
  testQuery(
    "multiple columns, different fragments",
    () =>
      builder(groupBy("base"))
        .groupBy("group")
        .groupBy("other.group"),
    `GROUP BY "base", "group", "other"."group"`
  );
});
