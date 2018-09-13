import { createFragment, FRAG } from "./createFragment";

const ARGUMENT = Symbol("fragmentum-argument");
export { createFragment };
export { select } from "./select";

function getFragmentMethods(fragment) {
  return fragment[FRAG];
}

export function fragment(...fragments) {
  return createFragment({
    serialize(args) {
      return fragments
        .map(fragment => {
          if (fragment[ARGUMENT]) {
            return serializeArgument(args, fragment);
          }

          return getFragmentMethods(fragment).serialize(args);
        })
        .join(" ");
    }
  });
}

export function from(...tables) {
  return createFragment({
    serialize(args) {
      return `FROM ${tables
        .map(table => {
          if (table[ARGUMENT]) {
            table = serializeArgument(args, table);
          }
          return `\`${table}\``;
        })
        .join(", ")}`;
    }
  });
}

export function execute(fragment) {
  let methods = getFragmentMethods(fragment);
  return {
    query: methods.serialize(),
    binds: {}
  };
}

function serializeArgument(args, argObj) {
  while (argObj[ARGUMENT]) {
    argObj = argObj.transducer(args[argObj.name]);
  }
  return argObj;
}

export function arg(name, transducer = val => val) {
  return {
    [ARGUMENT]: true,
    name,
    transducer
  };
}
