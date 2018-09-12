const FRAG = Symbol("fragmentum-internal");
const ARGUMENT = Symbol("fragmentum-argument");

function getFragmentMethods(fragment) {
  return fragment[FRAG];
}

function createFragment(methods) {
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

export function fragment(...fragments) {
  return createFragment({
    serialize(args) {
      return fragments
        .map(frag => {
          return getFragmentMethods(frag).serialize(args);
        })
        .join(" ");
    }
  });
}

export function select(...columns) {
  return createFragment({
    serialize(args) {
      return `SELECT ${columns.join(", ")}`;
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
