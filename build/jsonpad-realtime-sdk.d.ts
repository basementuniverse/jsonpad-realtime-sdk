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

declare class ItemEvent extends CustomEvent<any> {
    constructor(messageType: MessageType, detail: EventDetail<Item>);
}

declare class ListEvent extends CustomEvent<any> {
    constructor(messageType: MessageType, detail: EventDetail<List>);
}

declare class JSONPadRealtime extends EventTarget {
    private token;
    private static readonly connected;
    private static readonly disconnected;
    private socket;
    get connected(): boolean;
    /**
     * Create a new JSONPad realtime client instance
     */
    constructor(token: string);
    /**
     * Close the connection to the realtime server
     */
    close(): void;
    /**
     * Start listening for realtime events
     */
    listen(eventTypes: EventType[], listIds?: string[], itemIds?: string[]): void;
    private handleConnected;
    private handleDisconnected;
    private handleError;
    private handleEvent;
}

export { type EventDetail, type EventType, type Item, ItemEvent, type List, ListEvent, type MessageType, JSONPadRealtime as default };
