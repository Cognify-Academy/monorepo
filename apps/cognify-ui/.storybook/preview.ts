import type { Preview } from "@storybook/react";
import React from "react";
import "../src/app/globals.css";
import { AuthProvider } from "../src/contexts/auth";

// Mock API client for Storybook
const mockApiClient = {
  refresh: () =>
    Promise.resolve({
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1vY2stdXNlci1pZCIsInVzZXJuYW1lIjoibW9ja19pbnN0cnVjdG9yIiwiZW1haWwiOiJpbnN0cnVjdG9yQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiSU5TVFJVQ1RPUiIsIlNUVURFTlQiXX0.mock_signature",
    }),
  createSection: () =>
    Promise.resolve({
      id: `section-${Date.now()}`,
      title: "",
      description: "",
      order: 0,
      conceptIds: [],
    }),
  updateSection: () => Promise.resolve({}),
  deleteSection: () => Promise.resolve({}),
  createLesson: () =>
    Promise.resolve({
      id: `lesson-${Date.now()}`,
      title: "",
      description: "",
      content: null,
      order: 0,
      conceptIds: [],
    }),
  updateLesson: () => Promise.resolve({}),
  deleteLesson: () => Promise.resolve({}),
  reorderSections: () => Promise.resolve({}),
  reorderLessons: () => Promise.resolve({}),
};

const preview: Preview = {
  decorators: [
    (Story) => {
      // Mock the API client globally for Storybook
      if (typeof window !== "undefined") {
        (window as any).__STORYBOOK_API_CLIENT__ = mockApiClient;
      }

      return React.createElement(
        AuthProvider,
        null,
        React.createElement(Story),
      );
    },
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
