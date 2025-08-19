import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConceptSelector, type ConceptType } from "./concept-selector";

// Mock data for testing
const mockConcepts: ConceptType[] = [
  { id: "1", name: "React Hooks", slug: "react-hooks" },
  { id: "2", name: "TypeScript", slug: "typescript" },
  { id: "3", name: "State Management", slug: "state-management" },
  { id: "4", name: "Component Design", slug: "component-design" },
  { id: "5", name: "API Integration", slug: "api-integration" },
  { id: "6", name: "Testing", slug: "testing" },
  { id: "7", name: "Performance", slug: "performance" },
  { id: "8", name: "Accessibility", slug: "accessibility" },
  { id: "9", name: "CSS Styling", slug: "css-styling" },
  { id: "10", name: "Form Handling", slug: "form-handling" },
];

// API integration example (commented out for now)
/*
const fetchConcepts = async (): Promise<ConceptType[]> => {
  try {
    const response = await fetch('http://localhost:3333/api/v1/concepts');
    if (!response.ok) {
      throw new Error('Failed to fetch concepts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching concepts:', error);
    return mockConcepts; // Fallback to mock data
  }
};
*/

const meta: Meta<typeof ConceptSelector> = {
  title: "Components/ConceptSelector",
  component: ConceptSelector,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component for selecting multiple concepts with search functionality. Connects to API endpoint at http://localhost:3333/api/v1/concepts",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    availableConcepts: {
      description: "Array of available concepts to choose from",
      control: { type: "object" },
    },
    selectedConceptIds: {
      description: "Array of currently selected concept IDs",
      control: { type: "object" },
    },
    onChange: {
      description: "Callback function called when selection changes",
      action: "selection changed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConceptSelector>;

// Story component wrapper to handle state
const ConceptSelectorWithState = (args: {
  selectedConceptIds?: string[];
  onChange?: (ids: string[]) => void;
  availableConcepts?: ConceptType[];
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    args.selectedConceptIds || [],
  );

  return (
    <div className="w-96">
      <ConceptSelector
        {...args}
        availableConcepts={args.availableConcepts || mockConcepts}
        selectedConceptIds={selectedIds}
        onChange={(newSelection) => {
          setSelectedIds(newSelection);
          args.onChange?.(newSelection);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts,
    selectedConceptIds: [],
  },
};

export const WithSelectedConcepts: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts,
    selectedConceptIds: ["1", "3", "5"],
  },
};

export const LimitedConcepts: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts.slice(0, 4),
    selectedConceptIds: ["1"],
  },
};

export const EmptyConcepts: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: [],
    selectedConceptIds: [],
  },
};

export const AllSelected: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts.slice(0, 5),
    selectedConceptIds: ["1", "2", "3", "4", "5"],
  },
};

// API Integration Story (can be enabled when API is available)
const APIIntegrationComponent = () => {
  const [concepts, setConcepts] = useState<ConceptType[]>(mockConcepts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFromAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3333/api/v1/concepts");
      if (response.ok) {
        const data = await response.json();
        setConcepts(data);
      } else {
        setError(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setError(
        `Failed to connect to API: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.warn("API not available, using mock data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={fetchFromAPI}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch from API"}
        </button>
        <button
          onClick={() => {
            setConcepts(mockConcepts);
            setError(null);
          }}
          className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Use Mock Data
        </button>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="text-sm text-gray-600">
        Available concepts: {concepts.length}
      </div>
      <ConceptSelector
        availableConcepts={concepts}
        selectedConceptIds={selectedIds}
        onChange={setSelectedIds}
      />
    </div>
  );
};

export const WithAPIData: Story = {
  render: APIIntegrationComponent,
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates fetching concepts from the API endpoint. Click 'Fetch from API' to try connecting to http://localhost:3333/api/v1/concepts, or use mock data if the API is not available.",
      },
    },
  },
};

// Story showing search functionality
export const SearchFunctionality: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts,
    selectedConceptIds: ["2", "5"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the search functionality - type in the search box to filter available concepts.",
      },
    },
  },
};

export const Playground: Story = {
  render: ConceptSelectorWithState,
  args: {
    availableConcepts: mockConcepts,
    selectedConceptIds: ["2", "4"],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the controls below to experiment with different configurations.",
      },
    },
  },
};
