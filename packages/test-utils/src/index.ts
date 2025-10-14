// Shared test utilities for Cognify Academy
export * from "./vitest";
export * from "./playwright";
export * from "./storybook";
export * from "./common";

// Re-export common testing utilities
export { render, screen, fireEvent, waitFor } from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
// Note: expect from jest-dom is imported in test-setup.ts
