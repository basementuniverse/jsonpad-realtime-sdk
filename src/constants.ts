export const API_URL = 'https://realtime.jsonpad.io';
export const API_TOKEN_HEADER = 'x-api-token';

// The longest we'll wait before retrying a connection the server refused, in
// seconds, and how much random jitter to add to each wait
export const MAX_RETRY_DELAY = 300;
export const RETRY_JITTER = 0.2;
