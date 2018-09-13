export const FRAG = Symbol("fragmentum-internal");

export function createFragment(methods) {
  function fragmentThunk(args) {
    let nextFragment = createFragment({
      repr: parentArgs => {
        return methods.repr({
          ...parentArgs,
          ...args
        });
      },
      serialize(repr) {
        return methods.serialize(repr);
      }
    });
    return nextFragment;
  }
  fragmentThunk[FRAG] = methods;
  return fragmentThunk;
}
