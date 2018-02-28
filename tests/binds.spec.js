import { builder, select, from, where, bind, ops, value } from "fragmentum";
import { testQuery } from "./util";

describe("variable binds", () => {
  test("can bind variables", () => {
    const sql = builder(
      select(),
      from("users"),
      where(ops.eq("id", bind("user_id", 3)))
    ).serialize();
    expect(sql).toHaveProperty("binds");
    expect(sql).toHaveProperty("query");
    expect(sql).toMatchSnapshot();
  });
  test("value() will return a bound var with an anonymous key", () => {
    const sql = builder()
      .select()
      .from("users")
      .where(ops.eq("id", value(3)))
      .serialize();
    expect(Object.keys(sql.binds).length).toBe(1);
    expect(sql.binds[Object.keys(sql.binds)[0]]).toBe(3);
  });
});
