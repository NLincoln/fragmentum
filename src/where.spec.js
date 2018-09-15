import { fragment, execute, where, ops, arg, value } from "fragmentum";

let getById = where(ops.eq(arg("primaryKey"), arg("id", value)))({
  primaryKey: "id"
});

test("basic eq clause", () => {
  expect(
    execute(
      getById({
        id: "123"
      })
    ).query
  ).toEqual("`id` = '123'");
});
test("value() escapes as string", () => {
  expect(
    execute(ops.eq(value(arg("arg")), "username")({ arg: "userid" })).query
  ).toBe("'userid' = `username`");
});
test("combining multiple where fragments", () => {
  expect(
    execute(
      fragment(
        getById({
          id: "123"
        }),
        fragment(where(ops.eq("username", value("billy"))))
      )
    ).query
  ).toBe("WHERE `id` = '123' AND `username` = 'billy'");
});

describe("creating custom ops", () => {
  describe("validating the config", () => {
    test("providing nothing", () => {
      expect(() => {
        ops.createBinaryOp();
      }).toThrowErrorMatchingInlineSnapshot(
        `"createUnaryOp: Must provide a config object"`
      );
    });
    test("not providing an operand", () => {
      expect(() => {
        ops.createBinaryOp({
          not_operand: "++"
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"createUnaryOp: Expected a string for the operand, received undefined"`
      );
    });
    test("providing a bad value", () => {
      let summative = ops.createBinaryOp({
        operand: "++"
      });
      expect(() => {
        execute(summative({}, {}));
      }).toThrowErrorMatchingInlineSnapshot(
        `"operator ++ received invalid arguments. All arguments must be either strings, fragments, or args"`
      );
    });
  });
  describe("createUnaryOp", () => {
    let unary = ops.createUnaryOp({
      operand: "likable"
    });
    test("Providing one op (the good case)", () => {
      let { query } = execute(unary("col"));
      expect(query).toBe("likable `col`");
    });
    test("Providing two ops", () => {
      expect(() => {
        execute(unary("one", "two"));
      }).toThrowErrorMatchingInlineSnapshot(
        `"operator likable received too many params: received 2, expected 1"`
      );
    });
    test("Providing three ops", () => {
      expect(() => {
        execute(monadic("one", "two", "three"));
      }).toThrowErrorMatchingInlineSnapshot(`"monadic is not defined"`);
    });
  });
  describe("createBinaryOp", () => {
    let monadic = ops.createBinaryOp({
      operand: ">>="
    });
    test("Providing one op", () => {
      expect(() => {
        execute(monadic("col"));
      }).toThrowErrorMatchingInlineSnapshot(
        `"operator >>= received too few params: received 1, expected 2"`
      );
    });
    test("Providing two ops (the good case)", () => {
      let { query } = execute(monadic("col_a", "col_b"));
      expect(query).toBe("`col_a` >>= `col_b`");
    });
    test("Providing three ops", () => {
      expect(() => {
        execute(monadic("one", "two", "three"));
      }).toThrowErrorMatchingInlineSnapshot(
        `"operator >>= received too many params: received 3, expected 2"`
      );
    });
    test("providing a fragment to the op", () => {
      let { query } = execute(
        monadic("user_id", arg("user", value))({
          user: "123"
        })
      );
      expect(query).toBe("`user_id` >>= '123'");
    });
  });
  describe("createVariadicOp", () => {
    let summative = ops.createVariadicOp({
      operand: "++"
    });
    test("Providing one op", () => {
      expect(() => {
        execute(summative("one"));
      }).toThrowErrorMatchingInlineSnapshot(
        `"operator ++ received too few params: received 1, expected 2"`
      );
    });
    test("Providing two ops", () => {
      let { query } = execute(summative("one", "two"));
      expect(query).toBe("`one` ++ `two`");
    });
    test("Providing three ops", () => {
      let { query } = execute(summative("one", "two", "three"));
      expect(query).toBe("`one` ++ `two` ++ `three`");
    });
  });
});
