# ContactForm Component

A React component that provides a contact form with validation and submission handling.

## Features

- **Form Validation**: Client-side validation for all required fields
- **Email Validation**: Proper email format validation
- **Loading States**: Shows loading state during form submission
- **Error Handling**: Comprehensive error handling for network issues
- **Success Callbacks**: Callback functions for successful submissions
- **Error Callbacks**: Callback functions for handling errors
- **Form Reset**: Automatically clears form after successful submission
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation

## Usage

```tsx
import { ContactForm } from "@/components/contact-form";

function ContactPage() {
  return (
    <ContactForm
      onSuccess={(data) => {
        console.log("Form submitted:", data);
        // Handle success (e.g., show toast notification)
      }}
      onError={(error) => {
        console.error("Submission failed:", error);
        // Handle error (e.g., show error message)
      }}
    />
  );
}
```

## Props

| Prop        | Type                                                | Description                              |
| ----------- | --------------------------------------------------- | ---------------------------------------- |
| `className` | `string`                                            | Additional CSS classes for styling       |
| `onSuccess` | `(data: { id: string; createdAt: string }) => void` | Callback called on successful submission |
| `onError`   | `(error: string) => void`                           | Callback called when submission fails    |

## Form Fields

- **Name**: Required text input (1-100 characters)
- **Email**: Required email input with format validation
- **Subject**: Required text input (1-200 characters)
- **Message**: Required textarea (1-2000 characters)

## API Integration

The form submits to `/api/contact` which proxies to the backend API endpoint. The backend expects:

```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

And returns:

```json
{
  "message": "Contact form submitted successfully",
  "id": "string",
  "createdAt": "string"
}
```

## Validation Rules

- All fields are required
- Email must be in valid format
- Name: 1-100 characters
- Subject: 1-200 characters
- Message: 1-2000 characters

## Error Handling

The component handles various error scenarios:

- **Validation Errors**: Shows inline error messages
- **Network Errors**: Calls `onError` callback with error message
- **Server Errors**: Displays server error messages
- **Invalid Email**: Shows email format validation error

## Styling

The component uses Tailwind CSS classes and follows the existing design system. It's responsive and works well on all screen sizes.

## Accessibility

- Proper form labels with `htmlFor` attributes
- ARIA attributes for form validation
- Keyboard navigation support
- Screen reader friendly error messages
- Focus management during form submission

## Testing

The component includes comprehensive Storybook stories for testing different scenarios:

- Default state
- Validation errors
- Loading states
- Success scenarios
- Error handling
- Accessibility testing
- Responsive design testing

## Dependencies

- React (for component logic)
- Tailwind CSS (for styling)
- Built-in form validation
- Fetch API (for HTTP requests)
