import { execute, fragment, from, select, arg } from "fragmentum";

test("basic from statement", () => {
  let { query } = execute(from("users"));
  expect(query).toEqual("`users`");
});

test("with an arg", () => {
  let { query } = execute(
    from(arg("table"))({
      table: "users"
    })
  );
  expect(query).toEqual("`users`");
});

test("wrapping it in some FRAGMENT", () => {
  let { query } = execute(fragment(from("users")));

  expect(query).toEqual("FROM `users`");
});

test("combining multiple levels together (cross joins basically)", () => {
  let { query } = execute(fragment(from("users"), fragment(from("groups"))));
  expect(query).toEqual("FROM `users`, `groups`");
});
