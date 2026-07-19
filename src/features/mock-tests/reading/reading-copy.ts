// Shared copy for the Reading mock-test engine. Sentence case, CELPIP kept
// uppercase, and no long dashes. Centralized so routes and components stay
// consistent.

export const readingCopy = {
  disclaimer:
    "CELPIP Decoded is an independent practice platform. Practice results are not official CELPIP scores.",
  rawScoreNote:
    "This raw score is provided for CELPIP Decoded practice only. It is not an official CELPIP score.",
  savingIdle: "All answers saved",
  saving: "Saving",
  saved: "Saved",
  saveError: "Could not save. Retry",
  timerLabel: "Time remaining",
  errors: {
    invalidRequest: "That request was not valid. Please try again.",
    sessionExpired: "Your session has ended. Please sign in again.",
    notFound: "We could not find that mock test.",
    sessionNotFound: "We could not find that test session.",
    sessionClosed: "This test has already been submitted.",
    timeUp: "Your time is up. Submit the test to see your result.",
    saveFailed: "We could not save your answer. Please retry.",
    submitFailed: "We could not submit your test. Please try again.",
    startFailed: "We could not start your test. Please try again.",
    invalidAnswer: "That answer is not valid for this question.",
  },
} as const;
