import type { Meta, StoryObj } from "@storybook/react";
import { ContactForm } from "./contact-form";

const meta: Meta<typeof ContactForm> = {
  title: "Components/ContactForm",
  component: ContactForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A contact form component that handles form submission with validation and error handling.",
      },
    },
  },
  argTypes: {
    onSuccess: {
      description:
        "Callback function called when form is successfully submitted",
      action: "form-submitted",
    },
    onError: {
      description: "Callback function called when form submission fails",
      action: "form-error",
    },
    className: {
      description: "Additional CSS classes for styling",
      control: "text",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSuccessCallback: Story = {
  args: {
    onSuccess: (data: { id: string; createdAt: string }) => {
      console.log("Form submitted successfully:", data);
      alert(`Form submitted! ID: ${data.id}`);
    },
  },
};

export const WithErrorCallback: Story = {
  args: {
    onError: (error: string) => {
      console.error("Form submission error:", error);
      alert(`Error: ${error}`);
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: "max-w-md mx-auto",
  },
};

export const WithBothCallbacks: Story = {
  args: {
    onSuccess: (data: { id: string; createdAt: string }) => {
      console.log("Success:", data);
      alert("Form submitted successfully!");
    },
    onError: (error: string) => {
      console.error("Error:", error);
      alert(`Submission failed: ${error}`);
    },
  },
};

// Story for testing form validation
export const WithValidationErrors: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the form validation behavior. Try submitting the form without filling in required fields to see validation errors.",
      },
    },
  },
};

// Story for testing loading state
export const WithLoadingState: Story = {
  args: {
    onSuccess: () => new Promise((resolve) => setTimeout(resolve, 2000)),
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the loading state when the form is being submitted. The submit button will show 'Sending...' during submission.",
      },
    },
  },
};

// Story for testing network errors
export const WithNetworkError: Story = {
  args: {
    onError: (error: string) => {
      console.error("Network error:", error);
      alert(`Network error: ${error}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates error handling when network requests fail.",
      },
    },
  },
};

// Story for testing successful submission
export const WithSuccessfulSubmission: Story = {
  args: {
    onSuccess: (data: { id: string; createdAt: string }) => {
      console.log("Success data:", data);
      alert(`Success! Form submitted with ID: ${data.id}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates successful form submission with the returned data.",
      },
    },
  },
};

// Story for testing form reset
export const WithFormReset: Story = {
  args: {
    onSuccess: (data: { id: string; createdAt: string }) => {
      console.log("Form submitted and reset:", data);
      alert("Form submitted and reset successfully!");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates that the form fields are cleared after successful submission.",
      },
    },
  },
};

// Story for testing accessibility
export const Accessibility: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "This story focuses on accessibility features including proper labels, ARIA attributes, and keyboard navigation.",
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: "label",
            enabled: true,
          },
          {
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
};

// Story for testing responsive design
export const Responsive: Story = {
  args: {
    className: "w-full max-w-lg mx-auto",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "This story demonstrates the responsive behavior of the form on different screen sizes.",
      },
    },
  },
};

// Story for testing with pre-filled data
export const WithPrefilledData: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "This story can be used to test the form with pre-filled data by manually entering values.",
      },
    },
  },
};

// Story for testing error states
export const WithErrorStates: Story = {
  args: {
    onError: (error: string) => {
      console.error("Form error:", error);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates various error states including validation errors and submission failures.",
      },
    },
  },
};
