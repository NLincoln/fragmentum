import { createFragment, fragment, execute } from "fragmentum";

test("errors when executing a custom fragment without an ident", () => {
  let noident = createFragment(args => {
    return {
      serialize() {
        return "foo";
      }
    };
  });

  expect(() => {
    execute(fragment(noident));
  }).toThrowErrorMatchingInlineSnapshot(
    `"fragment: encountered a fragment without an ident arg. The ident arg is a value used to group fragments together."`
  );
});
