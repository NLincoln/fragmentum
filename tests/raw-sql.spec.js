import { builder, raw } from "fragmentum";
import { testQuery } from "./util";

describe("raw sql aka DANGER MODE", () => {
  testQuery(
    "We can just insert the SQL anywhere like an evil person",
    () =>
      builder()
        .select(raw("dangerous"))
        .from("users")
        .where(raw("id = 5")),
    `SELECT dangerous FROM "users" WHERE id = 5;`
  );
  testQuery(
    "Can pass in inline bind params",
    () => builder().where(raw("id = :user_id")),
    `WHERE id = :user_id`
  );
  testQuery(
    `can also pass in the bind value`,
    () => builder().where(raw("id = :user_id", { user_id: 2 })),
    {
      query: `WHERE id = :user_id`,
      binds: {
        user_id: 2
      }
    }
  );
});
