export const concatQueries = (arr, joinStr = ", ") => {
  const reduced = arr.filter(f => f.query).reduce(
    (prev, curr) => ({
      query: prev.query.concat(curr.query),
      binds: prev.binds.concat(curr.binds)
    }),
    {
      query: [],
      binds: []
    }
  );
  return {
    query: reduced.query.join(joinStr),
    binds: reduced.binds
  };
};
