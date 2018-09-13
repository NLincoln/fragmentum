import { createFragment, FRAG } from "./createFragment";
import { types } from "./fragmentTypes";

const ARGUMENT = Symbol("fragmentum-argument");
export { createFragment };
export { select } from "./select";

function getFragmentMethods(fragment) {
  return fragment[FRAG];
}

export function fragment(...children) {
  return createFragment({
    repr: args => {
      return {
        type: types.fragment,
        serialize(repr) {
          /**
           * At this point we have the tree of fully resolved args. Effectively,
           * we now have a "tree" of children. It's our job now to lift those children up into our current fragment.
           * We do this nice and recursively.
           */
          const lift = node => {
            return node.children.reduce((prev, curr) => {
              if (curr.type === types.fragment) {
                return prev.concat(lift(curr));
              }
              return prev.concat(curr);
            }, []);
          };
          let resolvedChildren = lift(repr);
          /**
           * Now we can actually do the job of grouping and serialization :raised_hands:
           *
           * First step is to get any arg fragments. Arg fragments aren't allowed to coexist with
           * any other fragments, but wrapping an arg in a fragment can be useful for composition
           * (probably)
           */
          let args = resolvedChildren.filter(
            child => child.type === types.resolvedArg
          );
          if (args.length > 0) {
            return args.map(arg => arg.value).join(" ");
          }
          let serializedChildren = resolvedChildren.map(child => {
            return child.serialize();
          });

          return resolvedChildren[0].wrap(
            resolvedChildren[0].combine(serializedChildren)
          );
        },

        children: children.map(child => {
          if (child[ARGUMENT]) {
            return {
              type: types.resolvedArg,
              value: serializeArgument(args, child)
            };
          }
          return getFragmentMethods(child).repr(args);
        })
      };
    }
  });
}

export function from(...tables) {
  return createFragment({
    repr: args => {
      return {
        type: types.from,
        wrap: tables => `FROM ${tables}`,
        combine: tables => tables.join(", "),
        serialize(repr) {
          return repr.tables.map(table => `\`${table}\``).join(", ");
        },
        tables: tables.map(table => {
          if (table[ARGUMENT]) {
            return serializeArgument(args, table);
          }
          return table;
        })
      };
    }
  });
}

export function execute(fragment) {
  let methods = getFragmentMethods(fragment);
  let repr = methods.repr({});

  return {
    query: repr.serialize(repr),
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
