import { builder, having, agg, ops, bind, rawValue } from "fragmentum";
import { testQuery } from "./util";

describe("fragment: having", () => {
  testQuery(
    "complex having test",
    () =>
      builder(having(ops.gt(agg.count(), rawValue(2))))
        .having(ops.lt(agg.sum("salary"), bind("salary", 20000)))
        .select()
        .from("employees")
        .groupBy("employees.id"),
    {
      query: `SELECT * FROM "employees" GROUP BY "employees"."id" HAVING (COUNT(*) > '2') AND (SUM("salary") < :salary);`,
      binds: { salary: 20000 }
    }
  );
});
