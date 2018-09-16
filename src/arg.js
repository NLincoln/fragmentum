const ARGUMENT = Symbol("fragmentum-argument");
export function isArgument(arg) {
  return arg && arg[ARGUMENT] === true;
}

/**
 *
 * @param {{ [x: string]: any }} args
 * @param {{ [Symbol()]: true, name: string, transducer: (val) => val }} argObj
 */
export function serializeArgument(args, argObj) {
  while (argObj[ARGUMENT]) {
    if (!args.hasOwnProperty(argObj.name)) {
      throw new Error(`Fragmentum: Expected a value for arg: ${argObj.name}, but it was not provided`)
    }
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
