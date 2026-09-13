# JSONPad Realtime SDK

This package allows you to connect to JSONPad Realtime and get realtime updates when your lists or items change.

## Installation

```bash
npm install @basementuniverse/jsonpad-realtime-sdk
```

## Usage

Create an instance of the JSONPad Realtime SDK and pass in your API token:

Node (JS):

```js
const JSONPadRealtime = require('@basementuniverse/jsonpad-realtime-sdk').default;

const jsonpadRealtime = new JSONPadRealtime('your-api-token');
```

Node (TS):

```ts
import JSONPadRealtime from '@basementuniverse/jsonpad-realtime-sdk';

const jsonpadRealtime = new JSONPadRealtime('your-api-token');
```

Browser:

```html
<script src="https://cdn.jsdelivr.net/npm/@basementuniverse/jsonpad-realtime-sdk@1.2.1/build/jsonpad-realtime-sdk.js"></script>
<script>

const jsonpadRealtime = new JSONPadRealtime.default('your-api-token');

</script>
```

Next, start listening for events on your lists or items:

```js
jsonpadRealtime.listen(
  [
    'list-created',
    'list-updated',
    'list-deleted',
    'item-created',
    'item-updated',
    'item-restored',
    'item-deleted',
  ]
);
```

Attach event listeners to the JSONPad Realtime SDK instance:

```js
jsonpadRealtime.addEventListener('list-created', e => {
  console.log(`A list called ${e.detail.model.name} was created!`);
});
```

If you want to stop listening for events and disconnect from the server, you can call the `close` method:

```js
jsonpadRealtime.close();
```

## Connection limits

Each plan limits how many realtime connections one account can hold open at the same time, counted across all of its tokens. A connection beyond that limit is refused while it is connecting, and arrives as an `error` event:

```js
jsonpadRealtime.addEventListener('error', e => {
  console.log(e.detail); // The error message
  console.log(e.errorName); // e.g. 'REALTIME_CONNECTION_LIMIT_EXCEEDED'
  console.log(e.code); // e.g. 10015
  console.log(e.max); // How many connections your plan allows
  console.log(e.retryAfter); // How long the server asked us to wait, in seconds
  console.log(e.retryIn); // How long until this client retries, or null
});
```

A connection that drops without closing cleanly keeps its slot on the server until the server notices it has gone, which takes up to 45 seconds. A client that reconnects immediately can therefore be refused for a limit it is no longer over, so this SDK retries a refused connection by itself, backing off from the delay the server asked for. Pass `retry: false` if you would rather handle it yourself:

```js
const jsonpadRealtime = new JSONPadRealtime('your-api-token', { retry: false });
```

The same happens if you subscribe to items by alias while one of your alias indexes is still being built: the connection is refused with `INDEX_BUILDING` (code 16006), and retried once the server's suggested delay has passed. Subscribing by item id always works.

## `listen()` method

The `listen()` method takes an array of event types to listen for. You can pass in any of the following event types:

- `list-created`
- `list-updated`
- `list-deleted`
- `item-created`
- `item-updated`
- `item-restored`
- `item-deleted`

You can also optionally pass in an array of list ids or path names, and item ids or aliases to listen for. For example:

```js
jsonpadRealtime.listen(
  [
    'list-updated',
    'item-updated',
  ],
  [
    '86059de7-9b16-4469-a630-23c8f69944b6',
    'a2c706a6-5212-4e8a-92ad-bce1beea153f',
    'my-list',
  ],
  [
    'e0bc4797-303a-49ff-b7b4-18781cc2460e',
    '06ad5a22-c002-4c67-92bc-83ec85014461',
    'my-item',
  ]
);
```

This will listen for `list-updated` events on the lists with ids `86059de7-9b16-4469-a630-23c8f69944b6` and `a2c706a6-5212-4e8a-92ad-bce1beea153f`, and the list with the path name `my-list` (provided those lists belong to the user who owns the token being used to authenticate).

It will also listen for `item-updated` events on the items with ids `e0bc4797-303a-49ff-b7b4-18781cc2460e` and `06ad5a22-c002-4c67-92bc-83ec85014461`, and the item with the alias `my-item` (again, provided those items belong to the user who owns the token being used to authenticate).

You can include `*` in the list ids and item ids arrays to listen for all lists or items. For example:

```js
jsonpadRealtime.listen(
  [
    'list-updated',
    'item-updated',
  ],
  ['*'],
  ['*']
);
```

This will listen for any list being updated, and any item being updated.

## Event types

- `list-created`: A list was created.
- `list-updated`: A list was updated.
- `list-deleted`: A list was deleted.
- `item-created`: An item was created.
- `item-updated`: An item was updated.
- `item-restored`: An item was restored.
- `item-deleted`: An item was deleted.

## Event object

The event object passed to the event listener has the following properties:

```ts
{
  type: string;
  details: {
    listId: string;
    itemId: string;
    model: any; // This will be a List or Item, depending on the event type
  };
}
```

## Guard indexes

If a list has any [guard indexes](https://jsonpad.io/documentation/indexing), the
values they point at are removed from an item's `data` before the event is
published, so they never reach a realtime client.

Realtime connections authenticate with an API token and can't use an identity,
so there is no realtime equivalent of the API's `includeGuarded` parameter. Read
a guarded value through the API instead, as the identity that owns the item.
