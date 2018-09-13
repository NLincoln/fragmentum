export const FRAG = Symbol("fragmentum-internal");

export function createFragment(methods) {
  function fragmentThunk(args) {
    let nextFragment = createFragment({
      serialize(parentArgs) {
        return methods.serialize({
          ...parentArgs,
          ...args
        });
      }
    });
    return nextFragment;
  }
  fragmentThunk[FRAG] = methods;
  return fragmentThunk;
}
