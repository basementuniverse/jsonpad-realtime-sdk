import { EventDetail, Item, MessageType } from '../types';

export class ItemEvent extends CustomEvent<any> {
  constructor(messageType: MessageType, detail: EventDetail<Item>) {
    super(messageType, { detail });
  }
}
