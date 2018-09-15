const ARGUMENT = Symbol("fragmentum-argument");
export function isArgument(arg) {
  return arg && arg[ARGUMENT] === true;
}

export function serializeArgument(args, argObj) {
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
