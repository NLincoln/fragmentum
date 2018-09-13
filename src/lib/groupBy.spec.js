import groupBy from "./groupBy";

test("basic groupBy", () => {
  let numbers = [1, 2, 3, 1, 1, 5, 6];
  expect(groupBy(numbers)).toEqual([[1, 1, 1], [2], [3], [5], [6]]);
});

test("it allows for a func to get the value", () => {
  let numbers = [1, 2, 3, 1, 1].map(num => ({ num }));
  expect(groupBy(numbers, num => num.num)).toEqual([
    [{ num: 1 }, { num: 1 }, { num: 1 }],
    [{ num: 2 }],
    [{ num: 3 }]
  ]);
});
