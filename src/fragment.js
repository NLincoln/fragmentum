import groupBy from "./lib/groupBy";
import { types } from "./fragmentTypes";
import { isArgument, serializeArgument } from "./arg";
const FRAG = Symbol("fragmentum-internal");

function getFragmentMethods(fragment) {
  return fragment[FRAG];
}

export function createFragment(createRepr) {
  function fragmentThunk(args) {
    let nextFragment = createFragment(parentArgs => {
      return createRepr({
        ...parentArgs,
        ...args
      });
    });
    return nextFragment;
  }
  fragmentThunk[FRAG] = createRepr;
  return fragmentThunk;
}

export function getFragmentRepr(fragment, args) {
  return getFragmentMethods(fragment)(args);
}

export function fragment(...children) {
  return createFragment(args => {
    return {
      type: types.fragment,
      serialize(repr) {
        /**
         * At this point we have the tree of fully resolved args. Effectively,
         * we now have a "tree" of children. It's our job now to lift those childgren up into our current fragment.
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
        let groupedChildren = groupBy(
          resolvedChildren,
          child => child.ordering
        );

        let sortedChildren = Array.from(groupedChildren)
          /**
           * Properly sort the children by their ordering
           */
          .sort((a, b) => {
            return a[0].ordering - b[0].ordering;
          })
          /**
           * Since the lowest-ordering comes first, reverse the result (the func above does highest-first)
           */
          .reverse();

        return (
          sortedChildren
            .map(group => {
              let serialized = group.map(child => child.serialize(child));
              return group[0].wrap(group[0].combine(serialized));
            })
            /**
             * Groups of fragments are separated by spaces.
             */
            .join(" ")
        );
      },

      children: children.map(child => {
        if (isArgument(child)) {
          return {
            type: types.resolvedArg,
            value: serializeArgument(args, child)
          };
        }
        return getFragmentMethods(child)(args);
      })
    };
  });
}
