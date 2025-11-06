export type Result<T> = { ok: true, value: T } | { ok: false; value?: never };
