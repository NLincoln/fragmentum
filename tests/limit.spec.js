import { testQuery } from "./util";
import { builder, limit, offset, bind } from "fragmentum";

describe("Limit-Offset", () => {
  testQuery(
    "can apply a limit fragment",
    () => builder(limit(10), offset(20)),
    `LIMIT 10 OFFSET 20`
  );
  testQuery(
    "with binds",
    () =>
      builder()
        .limit(bind("limit", 10))
        .offset(bind("offset", 20)),
    {
      query: `LIMIT :limit OFFSET :offset`,
      binds: [
        {
          limit: 10
        },
        {
          offset: 20
        }
      ]
    }
  );
  testQuery("lone fragment: limit", () => limit(10), "LIMIT 10");
  testQuery("lone fragment: offset", () => offset(20), "OFFSET 20");
});
