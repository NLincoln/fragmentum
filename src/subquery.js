import { createFragment } from "./fragment";
import { execute } from "./execute";

export const subquery = (alias, children) =>
  createFragment(args => {
    alias = execute(alias, args).query;
    children = execute(children, args).query;

    return {
      serialize() {
        return `(${children}) AS ${alias}`;
      }
    };
  });
