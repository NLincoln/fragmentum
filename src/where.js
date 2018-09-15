import { createFragment, isFragment, fragment } from "./fragment";
import { execute, isExecutable } from "./execute";
import SqlString from "sqlstring";
import { isArgument, serializeArgument } from "./arg";
import { orderings } from "./ordering";
const WHERE_IDENT = Symbol("where-ident");

export const value = val =>
  createFragment(args => {
    if (isArgument(val)) {
      val = serializeArgument(args, val);
    }
    return {
      serialize() {
        return SqlString.escape(val);
      }
    };
  });

const validateOpConfig = config => {
  if (!config) {
    throw new Error("createUnaryOp: Must provide a config object");
  }
  if (typeof config.operand !== "string") {
    throw new Error(
      "createUnaryOp: Expected a string for the operand, received " +
        config.operand
    );
  }
};

const validateOpParams = (config, params, min, max) => {
  if (params.length < min) {
    throw new Error(
      `operator ${config.operand} received too few params: received ${
        params.length
      }, expected ${min}`
    );
  }
  if (params.length > max) {
    throw new Error(
      `operator ${config.operand} received too many params: received ${
        params.length
      }, expected ${max}`
    );
  }
  params.forEach(param => {
    if (!isExecutable(param)) {
      throw new Error(
        `operator ${
          config.operand
        } received invalid arguments. All arguments must be either strings, fragments, or args`
      );
    }
  });
};

export const ops = {
  createUnaryOp: config => {
    validateOpConfig(config);
    const IDENT = Symbol(config.operand);
    return (...params) => {
      validateOpParams(config, params, 1, 1);
      return createFragment(args => {
        return {
          ident: IDENT,
          serialize() {
            return `${config.operand} ${execute(params[0], args).query}`;
          }
        };
      });
    };
  },
  createBinaryOp: config => {
    validateOpConfig(config);
    const IDENT = Symbol(config.operand);

    let operand = ` ${config.operand} `;
    return (...params) => {
      validateOpParams(config, params, 2, 2);
      return createFragment(args => {
        return {
          params: params.map(param => execute(param, args).query).join(operand),
          ident: IDENT,
          serialize(repr) {
            return repr.params;
          }
        };
      });
    };
  },
  createVariadicOp: config => {
    validateOpConfig(config);
    const IDENT = Symbol(config.operand);

    let operand = ` ${config.operand} `;
    return (...params) => {
      validateOpParams(config, params, 2, Infinity);
      return createFragment(args => {
        return {
          ident: IDENT,
          serialize() {
            return params
              .map(param => execute(param, args).query)
              .join(operand);
          }
        };
      });
    };
  }
};

Object.assign(ops, {
  eq: ops.createBinaryOp({
    operand: "="
  }),
  ne: ops.createBinaryOp({
    operand: "!="
  }),
  lt: ops.createBinaryOp({
    operand: "<"
  }),
  gt: ops.createBinaryOp({
    operand: ">"
  }),
  add: ops.createVariadicOp({
    operand: "+"
  }),
  in: ops.createUnaryOp({
    operand: "IN"
  }),
  like: ops.createUnaryOp({
    operand: "LIKE"
  })
});

export const where = (...conditions) => {
  return createFragment(args => {
    return {
      wrap: val => `WHERE ` + val,
      combine: wheres => wheres.join(" AND "),
      ident: WHERE_IDENT,
      ordering: orderings.where,
      serialize(repr) {
        return execute(fragment(...conditions), args).query;
      }
    };
  });
};
