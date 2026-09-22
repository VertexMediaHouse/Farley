/**
 * Escape hatch for untyped JSON (scraper payloads, form answers, stored rules)
 * whose shape isn't known at compile time. Prefer a real type where one exists.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Loose = any;
