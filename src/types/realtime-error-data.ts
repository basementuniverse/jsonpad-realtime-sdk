/**
 * The data attached to the error the server sends when it refuses a connection
 *
 * The name, code and message are the same ones the API returns in the body of
 * an error response
 */
export type RealtimeErrorData = {
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
