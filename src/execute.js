import { getFragmentRepr } from "./fragment";
export function execute(fragment) {
  let repr = getFragmentRepr(fragment, {});

  return {
    query: repr.serialize(repr),
    binds: {}
  };
}
