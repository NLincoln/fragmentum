import { builder, where, ops, bind } from "fragmentum";
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
        "providing 3 values",
        () => where(func("id", "di", "d3")),
        `("id" ${expected} "di" ${expected} "d3")`
      );
      testQuery("Providing one value", () => where(func("id")), `("id")`);
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
  test("in");
});
