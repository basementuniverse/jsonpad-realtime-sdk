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
