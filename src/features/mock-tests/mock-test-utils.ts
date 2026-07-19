// Small, pure helpers shared across the mock-test engine.

// The stable slug for the first mock test. Routes use the slug so more tests
// can be added without new components.
export const MOCK_TEST_1_SLUG = "mock-test-1";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// True when a string looks like a UUID. Used to reject bad path params before
// touching the database, so a malformed URL becomes a 404 instead of an error.
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// A conservative slug guard for mock-test path params.
export function isValidMockTestSlug(value: string): boolean {
  return /^[a-z0-9-]{1,64}$/.test(value);
}
