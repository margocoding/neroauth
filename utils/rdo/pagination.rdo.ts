export class PaginationRdo<T> {
  total: number;
  items: T[];

  constructor(total: number, items: T[]) {
    this.total = total;
    this.items = items;
  }
}
