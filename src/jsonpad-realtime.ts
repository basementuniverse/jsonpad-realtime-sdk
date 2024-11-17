import { io, Socket } from 'socket.io-client';
import * as constants from './constants';
import { ItemEvent } from './events/item-event';
import { ListEvent } from './events/list-event';
import { EventDetail, EventType, Item, List, MessageType } from './types';

export class JSONPadRealtime extends EventTarget {
  private static readonly connected = new Event('connected');
  private static readonly disconnected = new Event('disconnected');

  private socket: Socket | null = null;

  public get connected() {
    return this.socket?.connected ?? false;
  }

  /**
   * Create a new JSONPad realtime client instance
   */
  public constructor(private token: string) {
    super();
  }

  /**
   * Close the connection to the realtime server
   */
  public close() {
    if (this.socket && this.socket.connected) {
      this.socket.removeAllListeners();
      this.socket.close();
    }
  }

  /**
   * Start listening for realtime events
   */
  public listen(
    eventTypes: EventType[],
    listIds?: string[],
    itemIds?: string[]
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.removeAllListeners();
      this.socket.close();
    }

    if (eventTypes.length === 0) {
      throw new Error('At least one event type must be provided');
    }

    this.socket = io(
      `${constants.API_URL}?${new URLSearchParams({
        eventTypes: eventTypes.join(','),
        listIds: listIds?.join(',') ?? '',
        itemIds: itemIds?.join(',') ?? '',
      })}`,
      {
        extraHeaders: {
          [constants.API_TOKEN_HEADER]: this.token,
        },
      }
    );

    this.socket.on('connect', this.handleConnected.bind(this));
    this.socket.on('disconnect', this.handleDisconnected.bind(this));
    this.socket.on('error', this.handleError.bind(this));
    this.socket.on('list-created', this.handleEvent.bind(this, 'list-created'));
    this.socket.on('list-updated', this.handleEvent.bind(this, 'list-updated'));
    this.socket.on('list-deleted', this.handleEvent.bind(this, 'list-deleted'));
    this.socket.on('item-created', this.handleEvent.bind(this, 'item-created'));
    this.socket.on('item-updated', this.handleEvent.bind(this, 'item-updated'));
    this.socket.on(
      'item-restored',
      this.handleEvent.bind(this, 'item-restored')
    );
    this.socket.on('item-deleted', this.handleEvent.bind(this, 'item-deleted'));
  }

  private handleConnected() {
    this.dispatchEvent(JSONPadRealtime.connected);
  }

  private handleDisconnected() {
    this.dispatchEvent(JSONPadRealtime.disconnected);
  }

  private handleError(message: string) {
    this.dispatchEvent(new CustomEvent('error', { detail: message }));
  }

  private handleEvent(messageType: MessageType, data: string) {
    let parsedData: EventDetail<any>;
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      this.handleError('Failed to parse data');
      return;
    }

    switch (messageType) {
      case 'list-created':
        this.dispatchEvent(
          new ListEvent('list-created', parsedData as EventDetail<List>)
        );
        break;

      case 'list-updated':
        this.dispatchEvent(
          new ListEvent('list-updated', parsedData as EventDetail<List>)
        );
        break;

      case 'list-deleted':
        this.dispatchEvent(
          new ListEvent('list-deleted', parsedData as EventDetail<List>)
        );
        break;

      case 'item-created':
        this.dispatchEvent(
          new ItemEvent('item-created', parsedData as EventDetail<Item>)
        );
        break;

      case 'item-updated':
        this.dispatchEvent(
          new ItemEvent('item-updated', parsedData as EventDetail<Item>)
        );
        break;

      case 'item-restored':
        this.dispatchEvent(
          new ItemEvent('item-restored', parsedData as EventDetail<Item>)
        );
        break;

      case 'item-deleted':
        this.dispatchEvent(
          new ItemEvent('item-deleted', parsedData as EventDetail<Item>)
        );
        break;
    }
  }
}
