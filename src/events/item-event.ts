import { EventDetail, Item, MessageType } from '../types';

export class ItemEvent extends CustomEvent<any> {
  constructor(messageType: MessageType, detail: EventDetail<Item>) {
    if (detail.model.data && typeof detail.model.data === 'string') {
      try {
        detail.model.data = JSON.parse(detail.model.data);
      } catch (error) {}
    }
    super(messageType, { detail });
  }
}
