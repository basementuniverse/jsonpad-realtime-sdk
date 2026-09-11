import { RealtimeErrorData } from '../types';

/**
 * Dispatched as an 'error' event when the server refuses a connection, or when
 * an event arrives that can't be parsed
 *
 * The detail is the error message, as it was before this class existed, so
 * that anything already listening for 'error' keeps working
 */
export class RealtimeErrorEvent extends CustomEvent<string> {
  /**
   * The jsonpad error code, e.g. 10015, or null if the error didn't come from
   * the server
   */
  public readonly code: number | null;

  /**
   * The jsonpad error name, e.g. 'REALTIME_CONNECTION_LIMIT_EXCEEDED', or null
   * if the error didn't come from the server
   */
  public readonly errorName: string | null;

  /**
   * How many concurrent connections the account's plan allows, if the
   * connection was refused for holding too many of them
   */
  public readonly max: number | null;

  /**
   * How many seconds the server asked us to wait before trying again, or null
   * if it didn't
   */
  public readonly retryAfter: number | null;

  /**
   * How many seconds until this client retries the connection, or null if it
   * won't retry
   */
  public readonly retryIn: number | null;

  public constructor(
    message: string,
    data?: RealtimeErrorData,
    retryIn: number | null = null
  ) {
    super('error', { detail: message });

    this.code = data?.code ?? null;
    this.errorName = data?.name ?? null;
    this.max = data?.max ?? null;
    this.retryAfter = data?.retryAfter ?? null;
    this.retryIn = retryIn;
  }
}
