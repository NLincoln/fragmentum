/**
 * This is really just a basic test that we can provide some values as the top-level args
 *
 * This notion of "top-level args" isn't really useful as far as the user-facing api goes,
 * but I'm thinking it can make cases like subqueries much easier.
 */

import { execute, fragment, arg, isExecutable } from "fragmentum";

test("providing top-level-args", () => {
  let table = fragment(arg("table"));
  let { query } = execute(table, {
    table: "users"
  });
  expect(query).toEqual("users");
});

/**
 * I want execute to be a generic serialization primitive.
 *
 * With that in mind, I've elected to give it knowledge on how to serialize args.
 *
 * Once again, yes this capability could be done in userland via execute(fragment(arg)({ val }))
 * but I think that's missing the point: I want to throw
 */
test("providing an arg directly to execute()", () => {
  let { query } = execute(arg("table"), {
    table: "users"
  });
  expect(query).toEqual("`users`");
});

/**
 * ONCE AGAIN I've decided to expand the scope of execute()
 *
 * This time it's to add support for identifiers. This is, once again really weird, but
 * it should clean up a great deal of code
 */
test("providing a string to execute escapes it as an id", () => {
  let { query } = execute("foo");
  expect(query).toEqual("`foo`");
});

test("isExecutable", () => {
  let frag = fragment();
  let argument = arg("foo");
  expect(isExecutable(frag)).toBe(true);
  expect(isExecutable(argument)).toBe(true);
  expect(isExecutable("foobar")).toBe(true);
});

let notExecutable = [
  {
    value: NaN,
    desc: "NaN"
  },
  {
    value: 1234,
    desc: "a number"
  },
  {
    value: {},
    desc: "an object"
  },
  {
    value: () => {},
    desc: "a function"
  }
];

notExecutable.forEach(({ value, desc }) => {
  test("testing bad inputs " + desc, () => {
    expect(() => {
      execute(value);
    }).toThrow();
  });
});

notExecutable.forEach(({ value, desc }) => {
  test("testing not executable " + desc, () => {
    expect(isExecutable(value)).toBe(false);
  });
});
