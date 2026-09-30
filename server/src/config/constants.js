/** Tunable values used across the API. */
export const TOKEN_TTL = '7d';
export const BCRYPT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_MESSAGE_LENGTH = 2000;
export const MESSAGE_PAGE_SIZE = 100;   // messages returned per conversation load
export const DM_SCAN_LIMIT = 500;       // recent DMs scanned to build the sidebar list
export const USER_SEARCH_LIMIT = 8;
export const TYPING_TTL_MS = 4000;      // how long a "typing" ping stays valid

/** Fields exposed when populating related users. */
export const MEMBER_FIELDS = 'name username lastActive';
export const SENDER_FIELDS = 'name username';
