// Shared types for the CELPIP Decoded mock-test engine. These describe the
// generic mock-test and module shapes so the engine can grow to Mock Test 2
// and the upcoming Writing mock test without being rewritten.

export const MOCK_TESTS_MODULE_SLUG = "celpip-mock-tests";

// The status a mock test module can advertise for a given skill.
export type MockTestModuleStatus = "available" | "coming_soon";

// A single mock test, as shown in the library and overview screens.
export type MockTestSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  readingTimeSeconds: number;
};

// The database row shape for a mock test, as selected from Supabase.
export type MockTestRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  content_version: number;
  reading_time_seconds: number;
  reading_instruction_video_url: string | null;
};
