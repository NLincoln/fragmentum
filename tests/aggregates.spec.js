import { builder, select, agg, ops, rawValue, func } from "fragmentum";
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

describe("regular functions", () => {
  testQuery(
    "can make a custom function",
    () => builder().select(func("CONCAT", 2, rawValue(3))),
    `SELECT CONCAT('2', '3')`
  );
});
