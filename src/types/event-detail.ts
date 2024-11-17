export type EventDetail<T extends object> = {
  listId?: string;
  itemId?: string;
  model: T;
};
