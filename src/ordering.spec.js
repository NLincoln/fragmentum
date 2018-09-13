import { execute, select, from, fragment } from "fragmentum";

test("select comes before from", () => {
  let { query } = execute(fragment(from("users"), select("id")));
  expect(query).toEqual("SELECT `id` FROM `users`");
});
