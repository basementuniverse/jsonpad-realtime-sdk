import { io, Socket } from 'socket.io-client';
import * as constants from './constants';
import { ItemEvent } from './events/item-event';
import { ListEvent } from './events/list-event';
import { RealtimeErrorEvent } from './events/realtime-error-event';
import {
  EventDetail,
  EventType,
  Item,
  JSONPadRealtimeOptions,
  List,
  MessageType,
  RealtimeErrorData,
} from './types';

export class JSONPadRealtime extends EventTarget {
  private static readonly connected = new Event('connected');
  private static readonly disconnected = new Event('disconnected');

  private static readonly defaultOptions: Required<JSONPadRealtimeOptions> = {
    retry: true,
  };

  private readonly options: Required<JSONPadRealtimeOptions>;

  private socket: Socket | null = null;

  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  private retryAttempt: number = 0;

  public get connected() {
    return this.socket?.connected ?? false;
  }

  /**
   * Create a new JSONPad realtime client instance
   */
  public constructor(
    private token: string,
    options: JSONPadRealtimeOptions = {}
  ) {
    super();

    this.options = { ...JSONPadRealtime.defaultOptions, ...options };
  }

  /**
   * Close the connection to the realtime server
   */
  public close() {
    this.cancelRetry();
    this.closeSocket();
  }

  /**
   * Start listening for realtime events
   */
  public listen(
    eventTypes: EventType[],
    listIds?: string[],
    itemIds?: string[]
  ) {
    this.cancelRetry();
    this.closeSocket();

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
    this.socket.on('connect_error', this.handleConnectError.bind(this));
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

  /**
   * Close the current socket, if there is one
   *
   * A socket that is still connecting, or that is reconnecting in the
   * background, is holding a connection slot on the server just like a
   * connected one, so it gets closed too
   */
  private closeSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }
  }

  private handleConnected() {
    this.retryAttempt = 0;
    this.dispatchEvent(JSONPadRealtime.connected);
  }

  private handleDisconnected() {
    this.dispatchEvent(JSONPadRealtime.disconnected);
  }

  /**
   * A connection attempt failed
   *
   * Socket.IO retries by itself when it couldn't reach the server, and leaves
   * the socket inactive when the server refused the connection instead. A
   * refusal for holding too many concurrent connections is worth retrying,
   * since a connection the client has already lost is released once the
   * server notices it has gone.
   */
  private handleConnectError(error: Error & { data?: RealtimeErrorData }) {
    if (this.socket?.active) {
      return;
    }

    const retryAfter = error.data?.retryAfter ?? null;
    const retryIn =
      this.options.retry && retryAfter !== null
        ? this.retryDelay(retryAfter)
        : null;

    this.dispatchEvent(new RealtimeErrorEvent(error.message, error.data, retryIn));

    if (retryIn !== null) {
      this.retryAttempt++;
      this.retryTimeout = setTimeout(() => {
        this.retryTimeout = null;
        this.socket?.connect();
      }, retryIn * 1000);
    }
  }

  /**
   * Back off exponentially from the delay the server asked for, with a little
   * jitter so that clients refused at the same time don't all come back at the
   * same time
   */
  private retryDelay(retryAfter: number): number {
    const delay = Math.min(
      retryAfter * Math.pow(2, this.retryAttempt),
      constants.MAX_RETRY_DELAY
    );

    return Math.round(delay * (1 + Math.random() * constants.RETRY_JITTER));
  }

  private cancelRetry() {
    if (this.retryTimeout !== null) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.retryAttempt = 0;
  }

  private handleError(message: string) {
    this.dispatchEvent(new RealtimeErrorEvent(message));
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
