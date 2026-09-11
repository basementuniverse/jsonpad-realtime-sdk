export type JSONPadRealtimeOptions = {
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
