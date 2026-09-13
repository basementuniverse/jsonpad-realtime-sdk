/**
 * An item, as it arrives in a realtime event
 *
 * Realtime clients authenticate with an API token and never with an identity,
 * so any value covered by a guard index in the item's list has already been
 * removed from `data` before the event was published
 */
export type Item = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
  description: string;
  tags: string[];
  version: string;
  readonly: boolean;
  activated: boolean;
  size: number;
};
