import { arg, fragment, execute } from "fragmentum";

test("errors when arg is not provided", () => {
  let frag = fragment(arg("value"));

  expect(() => {
    execute(frag, {});
  }).toThrowErrorMatchingInlineSnapshot(
    `"Fragmentum: Expected a value for arg: value, but it was not provided"`
  );
});
