import { getFragmentRepr } from "./fragment";
export function execute(fragment, args = {}) {
  let repr = getFragmentRepr(fragment, args);

  return {
    query: repr.serialize(repr),
    binds: {}
  };
}
