import quote from "./quote";

describe("quote", () => {
  test("it escapes quotes appropriately", () => {
    expect(quote(`asdf"asdf`)).toEqual(`"asdf\\"asdf"`);
  });
  test("ditto for single quotes", () => {
    expect(quote(`asdf'asdf`, { single: true })).toEqual(`'asdf\\'asdf'`);
  });
});
