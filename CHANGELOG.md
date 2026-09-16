# Changelog

All notable changes to `@basementuniverse/jsonpad-realtime-sdk`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Dates are npm publish dates. Entries up to and including 1.2.1 were backfilled
on 2026-09-14 from git history and are deliberately brief.

## [1.5.1] - 2026-09-14

### Added

- This changelog was added in version 1.5.1.

## [1.5.0] - 2026-09-13

### Added

- `RealtimeErrorEvent` now carries the server's `code` and `errorName` for
  failures that are not connection refusals — for example `16006`, raised when
  an alias index is still being built.

## [1.4.0] - 2026-09-13

### Added

- `tags` on the `List` and `Item` event payload types.

## [1.3.1] - 2026-09-12

### Changed

- Documented the interaction with guard indexes: realtime clients authenticate
  with an API token and never with an identity, so any value covered by a guard
  index has already been removed from `data` before the event is published.

## [1.3.0] - 2026-09-12

The platform now caps concurrent realtime connections per account according to
plan, and refuses connections over that cap.

### Added

- `RealtimeErrorEvent`, dispatched as an `'error'` event, carrying the server's
  error `code` and `errorName`, the plan's connection limit (`max`), the delay
  the server asked for (`retryAfter`) and the delay this client will actually
  wait (`retryIn`). The event's `detail` is still the error message, so existing
  `'error'` listeners keep working.
- Automatic retry when a connection is refused for exceeding the connection
  limit, backing off exponentially from the server's requested delay with
  jitter. A connection lost to a network problem holds its server-side slot for
  up to 45 seconds, so an immediate reconnect can be refused for a limit the
  account is not really over.
- A `retry` option to turn that behaviour off. Defaults to `true`.

### Fixed

- A socket that was still connecting, or reconnecting in the background, was
  not closed by `close()` or by a subsequent `listen()`, and went on holding a
  connection slot on the server.

## [1.2.1] - 2024-12-17

### Changed

- Updated README.

## [1.2.0] - 2024-12-14

### Changed

- Model data on item events is parsed rather than passed through as a string.

## [1.1.0] - 2024-11-17

### Added

- Additional event and payload types.

### Fixed

- Build output.

## [1.0.0] - 2024-11-17

Initial release, alongside the JSONPad launch.

### Added

- `JSONPadRealtime`, a socket.io client for the JSONPad realtime server, for
  both Node and the browser.
- `listen()` with event type, list and item filtering, `close()`, and a
  `connected` getter.
- `connected`, `disconnected`, `error` and per-event-type events dispatched
  through `EventTarget`.
