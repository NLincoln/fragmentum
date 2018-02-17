import { builder, select, agg, ops } from "fragmentum";
import { testQuery } from "./util";

describe("aggregate functions", () => {
  testQuery("basic count", () => select(agg.count()), `COUNT(*)`);
  testQuery("count with column", select(agg.count("id")), `COUNT("id")`);
  testQuery(
    "max with expression",
    select(agg.sum(ops.add("id", "id2"))),
    `SUM(("id" + "id2"))`
  );
});
