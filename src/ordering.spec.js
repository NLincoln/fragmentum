import { execute, select, from, fragment, createFragment } from "fragmentum";

test("select comes before from", () => {
  let { query } = execute(fragment(from("users"), select("id")));
  expect(query).toEqual("SELECT `id` FROM `users`");
});

test("in the reverse order", () => {
  let { query } = execute(fragment(select("id"), from("users")));
  expect(query).toEqual("SELECT `id` FROM `users`");
});

describe("fragments without ordering", () => {
  let NO_ORDER_IDENT = Symbol("no-order");
  let noorder = createFragment(args => {
    return {
      ordering: null,
      ident: NO_ORDER_IDENT,
      serialize() {
        return "CUSTOM";
      }
    };
  });

  test("executing noorder alone", () => {
    /**
     * Should work fine, if there's only one then there's nothing to order it relative to
     */
    let { query } = execute(fragment(noorder));
    expect(query).toEqual("CUSTOM");
  });

  test("can execute two of them side-by-side", () => {
    /**
     * Once again, nothing to worry about here. There's no other fragments, so ordering should work.
     */
    let { query } = execute(fragment(noorder, noorder));
    expect(query).toEqual("CUSTOM,CUSTOM");
  });

  test("errors out when combining with another fragment", () => {
    expect(() => {
      execute(fragment(noorder, from("users")));
    }).toThrowErrorMatchingInlineSnapshot(
      `"Attempted to combine two unorderable fragments."`
    );
  });
});
