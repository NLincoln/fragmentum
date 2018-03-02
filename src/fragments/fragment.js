export default class Fragment {
  constructor() {
    this.isOverridable = false;
  }
  overridable() {
    const next = this.clone();
    next.isOverridable = true;
    return next;
  }
}
