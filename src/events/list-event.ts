import { EventDetail, List, MessageType } from '../types';

export class ListEvent extends CustomEvent<any> {
  constructor(messageType: MessageType, detail: EventDetail<List>) {
    super(messageType, { detail });
  }
}
