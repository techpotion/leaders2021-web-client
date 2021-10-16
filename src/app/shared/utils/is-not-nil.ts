export function isNotNil<T>(obj: T | null | undefined): obj is T {
  return obj !== null && obj !== undefined;
}
