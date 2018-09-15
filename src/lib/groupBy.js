export default function groupBy(values, getGroup = val => val) {
  /**
   * Use a Map under the hood to store the array of groups.
   */
  let groups = new Map();
  values.forEach(val => {
    let group = getGroup(val);
    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push(val);
  });
  let result = [];
  for (let key of groups.keys()) {
    result.push(groups.get(key));
  }
  return result;
}
