'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var socket_ioClient = require('socket.io-client');

class ItemEvent extends CustomEvent {
    constructor(messageType, detail) {
        if (detail.model.data && typeof detail.model.data === 'string') {
            try {
                detail.model.data = JSON.parse(detail.model.data);
            }
            catch (error) { }
        }
        super(messageType, { detail });
    }
}

class ListEvent extends CustomEvent {
    constructor(messageType, detail) {
        super(messageType, { detail });
    }
}

/**
 * Dispatched as an 'error' event when the server refuses a connection, or when
 * an event arrives that can't be parsed
 *
 * The detail is the error message, as it was before this class existed, so
 * that anything already listening for 'error' keeps working
 */
class RealtimeErrorEvent extends CustomEvent {
    constructor(message, data, retryIn = null) {
        var _a, _b, _c, _d;
        super('error', { detail: message });
        this.code = (_a = data === null || data === void 0 ? void 0 : data.code) !== null && _a !== void 0 ? _a : null;
        this.errorName = (_b = data === null || data === void 0 ? void 0 : data.name) !== null && _b !== void 0 ? _b : null;
        this.max = (_c = data === null || data === void 0 ? void 0 : data.max) !== null && _c !== void 0 ? _c : null;
        this.retryAfter = (_d = data === null || data === void 0 ? void 0 : data.retryAfter) !== null && _d !== void 0 ? _d : null;
        this.retryIn = retryIn;
    }
}

const API_URL = 'https://realtime.jsonpad.io';
const API_TOKEN_HEADER = 'x-api-token';
// The longest we'll wait before retrying a connection the server refused, in
// seconds, and how much random jitter to add to each wait
const MAX_RETRY_DELAY = 300;
const RETRY_JITTER = 0.2;

class JSONPadRealtime extends EventTarget {
    get connected() {
        var _a, _b;
        return (_b = (_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) !== null && _b !== void 0 ? _b : false;
    }
    /**
     * Create a new JSONPad realtime client instance
     */
    constructor(token, options = {}) {
        super();
        this.token = token;
        this.socket = null;
        this.retryTimeout = null;
        this.retryAttempt = 0;
        this.options = { ...JSONPadRealtime.defaultOptions, ...options };
    }
    /**
     * Close the connection to the realtime server
     */
    close() {
        this.cancelRetry();
        this.closeSocket();
    }
    /**
     * Start listening for realtime events
     */
    listen(eventTypes, listIds, itemIds) {
        var _a, _b;
        this.cancelRetry();
        this.closeSocket();
        if (eventTypes.length === 0) {
            throw new Error('At least one event type must be provided');
        }
        this.socket = socket_ioClient.io(`${API_URL}?${new URLSearchParams({
            eventTypes: eventTypes.join(','),
            listIds: (_a = listIds === null || listIds === void 0 ? void 0 : listIds.join(',')) !== null && _a !== void 0 ? _a : '',
            itemIds: (_b = itemIds === null || itemIds === void 0 ? void 0 : itemIds.join(',')) !== null && _b !== void 0 ? _b : '',
        })}`, {
            extraHeaders: {
                [API_TOKEN_HEADER]: this.token,
            },
        });
        this.socket.on('connect', this.handleConnected.bind(this));
        this.socket.on('connect_error', this.handleConnectError.bind(this));
        this.socket.on('disconnect', this.handleDisconnected.bind(this));
        this.socket.on('error', this.handleError.bind(this));
        this.socket.on('list-created', this.handleEvent.bind(this, 'list-created'));
        this.socket.on('list-updated', this.handleEvent.bind(this, 'list-updated'));
        this.socket.on('list-deleted', this.handleEvent.bind(this, 'list-deleted'));
        this.socket.on('item-created', this.handleEvent.bind(this, 'item-created'));
        this.socket.on('item-updated', this.handleEvent.bind(this, 'item-updated'));
        this.socket.on('item-restored', this.handleEvent.bind(this, 'item-restored'));
        this.socket.on('item-deleted', this.handleEvent.bind(this, 'item-deleted'));
    }
    /**
     * Close the current socket, if there is one
     *
     * A socket that is still connecting, or that is reconnecting in the
     * background, is holding a connection slot on the server just like a
     * connected one, so it gets closed too
     */
    closeSocket() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.close();
            this.socket = null;
        }
    }
    handleConnected() {
        this.retryAttempt = 0;
        this.dispatchEvent(JSONPadRealtime.connected);
    }
    handleDisconnected() {
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
    handleConnectError(error) {
        var _a, _b, _c;
        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.active) {
            return;
        }
        const retryAfter = (_c = (_b = error.data) === null || _b === void 0 ? void 0 : _b.retryAfter) !== null && _c !== void 0 ? _c : null;
        const retryIn = this.options.retry && retryAfter !== null
            ? this.retryDelay(retryAfter)
            : null;
        this.dispatchEvent(new RealtimeErrorEvent(error.message, error.data, retryIn));
        if (retryIn !== null) {
            this.retryAttempt++;
            this.retryTimeout = setTimeout(() => {
                var _a;
                this.retryTimeout = null;
                (_a = this.socket) === null || _a === void 0 ? void 0 : _a.connect();
            }, retryIn * 1000);
        }
    }
    /**
     * Back off exponentially from the delay the server asked for, with a little
     * jitter so that clients refused at the same time don't all come back at the
     * same time
     */
    retryDelay(retryAfter) {
        const delay = Math.min(retryAfter * Math.pow(2, this.retryAttempt), MAX_RETRY_DELAY);
        return Math.round(delay * (1 + Math.random() * RETRY_JITTER));
    }
    cancelRetry() {
        if (this.retryTimeout !== null) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
        this.retryAttempt = 0;
    }
    handleError(message) {
        this.dispatchEvent(new RealtimeErrorEvent(message));
    }
    handleEvent(messageType, data) {
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        }
        catch (error) {
            this.handleError('Failed to parse data');
            return;
        }
        switch (messageType) {
            case 'list-created':
                this.dispatchEvent(new ListEvent('list-created', parsedData));
                break;
            case 'list-updated':
                this.dispatchEvent(new ListEvent('list-updated', parsedData));
                break;
            case 'list-deleted':
                this.dispatchEvent(new ListEvent('list-deleted', parsedData));
                break;
            case 'item-created':
                this.dispatchEvent(new ItemEvent('item-created', parsedData));
                break;
            case 'item-updated':
                this.dispatchEvent(new ItemEvent('item-updated', parsedData));
                break;
            case 'item-restored':
                this.dispatchEvent(new ItemEvent('item-restored', parsedData));
                break;
            case 'item-deleted':
                this.dispatchEvent(new ItemEvent('item-deleted', parsedData));
                break;
        }
    }
}
JSONPadRealtime.connected = new Event('connected');
JSONPadRealtime.disconnected = new Event('disconnected');
JSONPadRealtime.defaultOptions = {
    retry: true,
};

exports.ItemEvent = ItemEvent;
exports.ListEvent = ListEvent;
exports.RealtimeErrorEvent = RealtimeErrorEvent;
exports.default = JSONPadRealtime;
