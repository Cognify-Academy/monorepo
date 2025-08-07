# Course Cloud Components

This directory contains three focused course cloud components that provide different functionality for displaying courses based on context.

## Components

### 1. ComingSoonCourses

Displays unpublished courses that are coming soon.

**Features:**

- Fetches all courses and filters for unpublished ones
- Shows estimated duration and concept count
- Displays "Coming Soon" status badge
- No authentication required

**Usage:**

```tsx
import { ComingSoonCourses } from "@/components/course-clouds";

<ComingSoonCourses
  title="Coming Soon"
  subtitle="Exciting new courses in development"
/>;
```

### 2. EnrolledCourses

Displays courses that a student has enrolled in with progress tracking.

**Features:**

- Requires student authentication
- Shows progress percentage and estimated time left
- Displays "Enrolled" status badge
- Links to course pages for resuming
- Handles empty state with call-to-action

**Usage:**

```tsx
import { EnrolledCourses } from "@/components/course-clouds";

<EnrolledCourses
  title="My Enrolled Courses"
  subtitle="Continue your learning journey"
/>;
```

### 3. InstructorCourses

Displays courses created by an instructor with management capabilities.

**Features:**

- Requires instructor authentication and role
- Shows published/draft status
- Displays creation date
- Links to course editing pages
- Handles empty state with create course CTA

**Usage:**

```tsx
import { InstructorCourses } from "@/components/course-clouds";

<InstructorCourses
  title="My Courses"
  subtitle="Manage your published and draft courses"
/>;
```

## API Endpoints Used

- `ComingSoonCourses`: `GET /courses` (filters for `published: false`)
- `EnrolledCourses`: `GET /student/courses` (requires auth token)
- `InstructorCourses`: `GET /instructor/courses` (requires auth token + instructor role)

## Common Props

All components accept:

- `title?: string` - Section title
- `subtitle?: string` - Section subtitle
- `className?: string` - Additional CSS classes

## Error Handling

All components include:

- Loading states with spinners
- Error states with user-friendly messages
- Empty states with appropriate CTAs
- Authentication checks where required

## Styling

Components use consistent Tailwind CSS classes and follow the existing design system:

- Gray background (`bg-gray-50`)
- Card-based layout with hover effects
- Consistent spacing and typography
- Color-coded status badges
- Responsive grid layouts

## Migration from MyActiveCourses

The existing `MyActiveCourses` component was complex because it tried to handle multiple contexts. These new components provide:

1. **Better separation of concerns** - Each component has a single responsibility
2. **Easier testing** - Focused functionality is easier to test
3. **Better performance** - Only fetches data when needed
4. **Cleaner code** - No complex conditional logic
5. **Better UX** - Context-appropriate UI and messaging

## Example: Replacing MyActiveCourses

**Before:**

```tsx
<MyActiveCourses context="instructor" />
<MyActiveCourses context="student" />
```

**After:**

```tsx
<InstructorCourses />
<EnrolledCourses />
```

This approach is much cleaner and more maintainable!
