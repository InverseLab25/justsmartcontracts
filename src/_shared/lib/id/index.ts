export type TUid = string;

// Replaces the uuid package. Available in every browser this app targets, but
// only over https or localhost, hence the fallback.
export const uid = (): TUid =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
