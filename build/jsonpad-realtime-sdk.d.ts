type EventDetail<T extends object> = {
    listId?: string;
    itemId?: string;
    model: T;
};

type EventType = 'list-created' | 'list-updated' | 'list-deleted' | 'item-created' | 'item-updated' | 'item-restored' | 'item-deleted';

type Item = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    data: any;
    description: string;
    version: string;
    readonly: boolean;
    activated: boolean;
    size: number;
};

type JSONPadRealtimeOptions = {
    /**
     * Retry a connection that the server refused because the account is already
     * holding as many concurrent connections as its plan allows
     *
     * A connection lost to a network problem keeps its slot on the server until
     * the server notices it has gone, which takes up to 45 seconds. A client
     * that reconnects immediately can be refused for a limit it isn't really
     * over, so retrying with a backoff gets it back on once the old connection
     * has been cleaned up.
     *
     * Defaults to true.
     */
    retry?: boolean;
};

type List = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lastActiveAt: Date | null;
        activated: boolean;
        displayName: string;
        description: string;
    };
    name: string;
    description: string;
    pathName: string;
    schema: any;
    pinned: boolean;
    readonly: boolean;
    realtime: boolean;
    protected: boolean;
    indexable: boolean;
    activated: boolean;
    itemCount: number;
};

type MessageType = 'error' | 'list-created' | 'list-updated' | 'list-deleted' | 'item-created' | 'item-updated' | 'item-restored' | 'item-deleted';

/**
 * The data attached to the error the server sends when it refuses a connection
 *
 * The name, code and message are the same ones the API returns in the body of
 * an error response
 */
type RealtimeErrorData = {
    name: string;
    code: number;
    message: string;
    /**
     * How many concurrent connections the account's plan allows, present when
     * the connection was refused for holding too many of them
     */
    max?: number;
    /**
     * How many seconds to wait before trying again, present when trying again
     * is worthwhile
     */
    retryAfter?: number;
};

declare class ItemEvent extends CustomEvent<any> {
    constructor(messageType: MessageType, detail: EventDetail<Item>);
}

declare class ListEvent extends CustomEvent<any> {
    constructor(messageType: MessageType, detail: EventDetail<List>);
}

/**
 * Dispatched as an 'error' event when the server refuses a connection, or when
 * an event arrives that can't be parsed
 *
 * The detail is the error message, as it was before this class existed, so
 * that anything already listening for 'error' keeps working
 */
declare class RealtimeErrorEvent extends CustomEvent<string> {
    /**
     * The jsonpad error code, e.g. 10015, or null if the error didn't come from
     * the server
     */
    readonly code: number | null;
    /**
     * The jsonpad error name, e.g. 'REALTIME_CONNECTION_LIMIT_EXCEEDED', or null
     * if the error didn't come from the server
     */
    readonly errorName: string | null;
    /**
     * How many concurrent connections the account's plan allows, if the
     * connection was refused for holding too many of them
     */
    readonly max: number | null;
    /**
     * How many seconds the server asked us to wait before trying again, or null
     * if it didn't
     */
    readonly retryAfter: number | null;
    /**
     * How many seconds until this client retries the connection, or null if it
     * won't retry
     */
    readonly retryIn: number | null;
    constructor(message: string, data?: RealtimeErrorData, retryIn?: number | null);
}

declare class JSONPadRealtime extends EventTarget {
    private token;
    private static readonly connected;
    private static readonly disconnected;
    private static readonly defaultOptions;
    private readonly options;
    private socket;
    private retryTimeout;
    private retryAttempt;
    get connected(): boolean;
    /**
     * Create a new JSONPad realtime client instance
     */
    constructor(token: string, options?: JSONPadRealtimeOptions);
    /**
     * Close the connection to the realtime server
     */
    close(): void;
    /**
     * Start listening for realtime events
     */
    listen(eventTypes: EventType[], listIds?: string[], itemIds?: string[]): void;
    /**
     * Close the current socket, if there is one
     *
     * A socket that is still connecting, or that is reconnecting in the
     * background, is holding a connection slot on the server just like a
     * connected one, so it gets closed too
     */
    private closeSocket;
    private handleConnected;
    private handleDisconnected;
    /**
     * A connection attempt failed
     *
     * Socket.IO retries by itself when it couldn't reach the server, and leaves
     * the socket inactive when the server refused the connection instead. A
     * refusal for holding too many concurrent connections is worth retrying,
     * since a connection the client has already lost is released once the
     * server notices it has gone.
     */
    private handleConnectError;
    /**
     * Back off exponentially from the delay the server asked for, with a little
     * jitter so that clients refused at the same time don't all come back at the
     * same time
     */
    private retryDelay;
    private cancelRetry;
    private handleError;
    private handleEvent;
}

export { type EventDetail, type EventType, type Item, ItemEvent, type JSONPadRealtimeOptions, type List, ListEvent, type MessageType, type RealtimeErrorData, RealtimeErrorEvent, JSONPadRealtime as default };
