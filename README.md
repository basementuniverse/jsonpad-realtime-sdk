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
<script src="jsonpad-realtime-sdk.js"></script>
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

You can also optionally pass in an array of list ids and item ids to listen for.

You can include `*` in the list ids and item ids arrays to listen for all lists or items.

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
  ],
  [
    '86059de7-9b16-4469-a630-23c8f69944b6',
    'a2c706a6-5212-4e8a-92ad-bce1beea153f',
  ],
  [
    'e0bc4797-303a-49ff-b7b4-18781cc2460e',
    '06ad5a22-c002-4c67-92bc-83ec85014461',
  ]
);
```

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
  detail: {
    listId: string;
    itemId: string;
    model: any; // This will be a List or Item, depending on the event type
  };
}
```
