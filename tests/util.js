export const testQuery = (name, query, expected) =>
  test(name, () => {
    if (typeof query === "function") {
      query = query();
    }
    const sql = query.serialize();
    if (!expected) {
      expect(sql).toMatchSnapshot();
    } else if (typeof expected === "object") {
      expect(sql).toEqual(expected);
    } else {
      expect(sql.query).toEqual(expected);
    }
  });
