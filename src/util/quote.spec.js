import quote from "./quote";

describe("quote", () => {
  test("it escapes quotes appropriately", () => {
    expect(quote(`asdf"asdf`)).toEqual(`"asdf\\"asdf"`);
  });
  test("ditto for single quotes", () => {
    expect(quote(`asdf'asdf`, { single: true })).toEqual(`'asdf\\'asdf'`);
  });
  test.skip("composite column support", () => {
    expect(quote("(table.composite).field")).toEqual(
      `("table"."composite")."field"`
    );
    expect(quote("(table.composite).*")).toEqual(`("table"."composite").*`);
  });
  test("what if the quotes are already there???", () => {
    expect(quote(`"asdf"`)).toBe(`"asdf"`);
    expect(quote(`'asdf'`, { single: true })).toBe(`'asdf'`);
  });
});
