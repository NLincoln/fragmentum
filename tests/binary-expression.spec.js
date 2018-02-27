import { builder, where, ops, bind, select, rawValue } from "fragmentum";
import { testQuery } from "./util";

describe("binary expressions", () => {
  const binaryOpTest = (func, expected) => {
    describe(`Optests: ${expected}`, () => {
      testQuery(
        "simple string columns",
        () => where(func("a", "b")),
        `("a" ${expected} "b")`
      );
      testQuery("binds", () => where(func("a", bind("userid", 2))), {
        query: `("a" ${expected} :userid)`,
        binds: [
          {
            userid: 2
          }
        ]
      });
      testQuery(
        "nesting",
        () => where(func("a", func("b", "c"))),
        `("a" ${expected} ("b" ${expected} "c"))`
      );
    });
  };
  binaryOpTest(ops.eq, "=");
  binaryOpTest(ops.gt, ">");
  binaryOpTest(ops.lt, "<");
  binaryOpTest(ops.ne, "!=");
  binaryOpTest(ops.gte, ">=");
  binaryOpTest(ops.lte, "<=");
  binaryOpTest(ops.bit.shiftLeft, "<<");
  binaryOpTest(ops.bit.shiftRight, ">>");
  const associativeOpsTest = (func, expected, name = expected) => {
    binaryOpTest(func, expected);
    describe(`Associative OpTests: ${name}`, () => {
      testQuery(
        "providing 3 rawValues",
        () => where(func("id", "di", "d3")),
        `("id" ${expected} "di" ${expected} "d3")`
      );
      testQuery("Providing one rawValue", () => where(func("id")), `("id")`);
    });
  };
  associativeOpsTest(ops.add, "+");
  associativeOpsTest(ops.sub, "-");
  associativeOpsTest(ops.div, "/");
  associativeOpsTest(ops.mult, "*");
  associativeOpsTest(ops.bit.and, "&");
  associativeOpsTest(ops.bit.or, "|");
  associativeOpsTest(ops.bit.xor, "#");
  test("NOT !");
  test("like");
  describe("in", () => {
    testQuery(
      "passing a subquery",
      () => builder().where(ops.in("id", builder(select("id")).from("users"))),
      `WHERE ("id" IN (SELECT "id" FROM "users"))`
    );
    testQuery(
      "passing in an array of rawValues",
      () => builder().where(ops.in("id", [1, 2, 3].map(rawValue))),
      `WHERE ("id" IN ('1', '2', '3'))`
    );
    testQuery(
      "passing in a bind expression",
      () => builder().where(ops.in("id", bind("id", [1, 2, 3]))),
      { query: `WHERE ("id" IN :id)`, binds: { id: [1, 2, 3] } }
    );
    testQuery(
      "passing in further expressions because why the heck not",
      () =>
        builder().where(
          ops.in("id", [
            builder()
              .select("id")
              .from("users"),
            builder()
              .select("id")
              .from("users"),
            ops.add(rawValue(1), rawValue(2))
          ])
        ),
      `WHERE ("id" IN ((SELECT "id" FROM "users"), (SELECT "id" FROM "users"), ('1' + '2')))`
    );
  });
});
