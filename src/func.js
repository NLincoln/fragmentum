import { createFragment } from "./fragment";
import { execute } from "./execute";

export const createFunc = config => {
  const IDENT = Symbol();
  return (...params) =>
    createFragment(args => {
      params = params.map(param => execute(param, args).query);
      return {
        ident: IDENT,
        serialize() {
          return `${config.name}(${params.join(", ")})`;
        }
      };
    });
};

const COUNT_IDENT = Symbol();
const count = arg => {
  return createFragment(args => {
    if (!arg || arg == "*") {
      arg = "*";
    } else {
      arg = execute(arg, args).query;
    }
    return {
      ident: COUNT_IDENT,
      serialize() {
        return `COUNT(${arg})`;
      }
    };
  });
};

export const func = {
  count,
  avg: createFunc({ name: "AVG" }),
  concat: createFunc({ name: "CONCAT" })
};
