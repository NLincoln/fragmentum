import {
  builder,
  select,
  from,
  where,
  ops,
  agg,
  rawValue,
  limit,
  offset
} from "fragmentum";
import { testQuery } from "./util";

describe("builder", () => {
  testQuery(
    "concat-ing from another builder",
    builder(builder().select(), builder().from("users")),
    `SELECT * FROM "users";`
  );
  testQuery("list of fragments", builder(select("user"), from("users")));
  testQuery(
    "method chaining",
    builder()
      .select("user")
      .from("users")
  );
  testQuery("a healthy mix", builder(select()).from("users"));
});

describe("conditional fragments", () => {
  testQuery(
    "conditional fragments as part of a builder / concat",
    builder(false, select("users"))
      .from("users")
      .concat(false, select("id")),
    `SELECT "users", "id" FROM "users";`
  );
  testQuery(
    "conditional parts of an expression",
    builder(select(), from("users"), where(false)),
    `SELECT * FROM "users";`
  );
});
describe("Serializing just fragments", () => {
  testQuery(
    "omitting the select portion",
    builder(from("users")),
    `FROM "users"`
  );
  testQuery("omitting the from portion", builder(select()), "SELECT *");
  testQuery("select", select(), "*");
  testQuery("from", from("users"), `"users"`);
  testQuery(
    "where",
    where(ops.eq("username", rawValue(2))),
    `("username" = '2')`
  );
});

testQuery(
  "table.column syntax",
  builder().select(
    "user.*",
    "user.username",
    "groups.groupname",
    "user.id",
    ["user.first_name", "first"],
    {
      "user.last_name": "last"
    }
  ),
  `SELECT "user".*, "user"."username", "groups"."groupname", "user"."id", "user"."first_name" AS "first", "user"."last_name" AS "last"`
);

test("A big integration test to make sure that things can be composed well", () => {
  const checkUserAccess = (accountID, fragment) => {
    return builder(
      fragment,
      where(ops.eq("users.account_id", rawValue(accountID)))
    );
  };
  const paginate = ({ page = 1, per_page = 10 }, fragment) =>
    builder(
      select(agg.count().over()),
      from(fragment),
      limit(rawValue(per_page)),
      offset(rawValue((page - 1) * per_page))
    );
  const sql = paginate(
    {
      page: 1,
      per_page: 3
    },
    checkUserAccess(
      2000,
      builder(select("id", "username", "account_id"), from("users")).setAlias(
        "alias"
      )
    )
  );
  const { query, binds } = sql.serialize();
  expect(query).toBe(
    `SELECT COUNT(*) OVER () FROM (SELECT "id", "username", "account_id" FROM "users" WHERE ("users"."account_id" = '2000')) AS "alias" LIMIT '3' OFFSET '0';`
  );
});
