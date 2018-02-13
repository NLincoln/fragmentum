import quote from "./quote";

export default raw =>
  raw
    .split(".")
    .map(quote)
    .join(".");
