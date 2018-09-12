const FRAG = Symbol("fragmentum-internal");
const CURRENT_ARGS = Symbol("fragmentum-current-args");
const ARGUMENT = Symbol("fragmentum-argument");

function getCurrentArgs(fragment) {
  return fragment[CURRENT_ARGS];
}

function getFragmentMethods(fragment) {
  return fragment[FRAG];
}

function isFragment(fragment) {
  return Boolean(getFragmentMethods(fragment));
}

function createFragment(methods) {
  function fragmentThunk(args) {
    let nextFragment = createFragment({
      serialize(args) {
        return methods.serialize(args);
      }
    });
    nextFragment[CURRENT_ARGS] = {
      ...args
    };
    return nextFragment;
  }
  fragmentThunk[CURRENT_ARGS] = {};
  fragmentThunk[FRAG] = methods;
  return fragmentThunk;
}

exports.fragment = function fragment(...fragments) {
  return createFragment({
    serialize(args) {
      return fragments
        .map(frag => {
          /**
           * So what happens when we wrap a fragment in a fragment?
           */
          return getFragmentMethods(frag).serialize({
            ...args,
            ...getCurrentArgs(frag)
          });
        })
        .join(" ");
    }
  });
};

exports.select = function select(...columns) {
  return createFragment({
    serialize(args) {
      return `SELECT ${columns.join(", ")}`;
    }
  });
};

exports.from = function from(...tables) {
  return createFragment({
    serialize(args) {
      return `FROM ${tables
        .map(table => {
          if (isFragment(table)) {
            table = getFragmentMethods(table).serialize(args);
          }
          if (table[ARGUMENT]) {
            table = serializeArgument(args, table);
          }
          return `\`${table}\``;
        })
        .join(", ")}`;
    }
  });
};

exports.execute = function execute(fragment) {
  let methods = getFragmentMethods(fragment);
  return {
    query: methods.serialize(fragment[CURRENT_ARGS]),
    binds: {}
  };
};

function serializeArgument(args, argObj) {
  return argObj.transducer(args[argObj.name]);
}

exports.arg = function arg(name, transducer = val => val) {
  return {
    [ARGUMENT]: true,
    name,
    transducer
  };
};
