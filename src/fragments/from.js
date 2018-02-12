import Fragment from "./fragment";

export default class FromFragment extends Fragment {
  constructor(table) {
    super();
    this.table = table;
  }
  serialize() {
    return `"${this.table}"`;
  }
}
export const from = table => new FromFragment(table);
