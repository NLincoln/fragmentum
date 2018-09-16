import { fragment, execute, func, createFunc, select, value } from "fragmentum";

test("executing a lone func", () => {
  let { query } = execute(func.count("*"));
  expect(query).toBe("COUNT(*)");
});

test("count()-ing an actual column", () => {
  let { query } = execute(func.count("userid"));
  expect(query).toBe("COUNT(`userid`)");
});

test("count() produces count(*)", () => {
  let { query } = execute(func.count());
  expect(query).toBe("COUNT(*)");
});

test("creating a custom func", () => {
  let trim = createFunc({
    name: "TRIM"
  });
  let { query } = execute(trim(value("  a  ")));
  expect(query).toBe(`TRIM('  a  ')`);
});
