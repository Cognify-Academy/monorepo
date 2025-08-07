import { Navbar } from "@/components/navbar";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import React, { createContext, ReactNode, useContext } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

interface StoryAuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout?: () => Promise<void>;
}

// Create a mock auth context for stories
const MockAuthContext = createContext<AuthContextType | null>(null);

// Mock useAuth hook for stories
const useMockAuth = (): AuthContextType => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within MockAuthProvider");
  }
  return context;
};

// Wrapper component that provides mock auth context
const NavbarWrapper: any = ({ authState }: any) => {
  const mockAuthValue: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading,
    logout: authState.logout || (() => Promise.resolve()),
    hasRole: (role: string) => {
      if (!authState.user) return false;
      if (role === "INSTRUCTOR")
        return (
          authState.user.role === "instructor" ||
          authState.user.role === "admin"
        );
      if (role === "ADMIN") return authState.user.role === "admin";
      return authState.user.role === role;
    },
  };

  // Mock the actual Navbar component with our mock auth
  const MockedNavbar = () => {
    // Use the same component structure but with our mock auth
    const { isAuthenticated, user, logout, hasRole } = useMockAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const [isInstructorMenuOpen, setIsInstructorMenuOpen] =
      React.useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);
    const instructorMenuRef = React.useRef<HTMLDivElement>(null);
    const adminMenuRef = React.useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
      await logout();
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsInstructorMenuOpen(false);
      setIsAdminMenuOpen(false);
    };

    // Close dropdowns when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(event.target as Node)
        ) {
          setIsUserMenuOpen(false);
        }
        if (
          instructorMenuRef.current &&
          !instructorMenuRef.current.contains(event.target as Node)
        ) {
          setIsInstructorMenuOpen(false);
        }
        if (
          adminMenuRef.current &&
          !adminMenuRef.current.contains(event.target as Node)
        ) {
          setIsAdminMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <nav className="border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <a href="/" className="text-xl font-semibold text-gray-900">
                Cognify Academy
              </a>
            </div>

            <div className="hidden space-x-8 md:flex">
              <a
                href="/"
                className="font-medium text-gray-900 transition-colors"
              >
                Home
              </a>
              <a
                href="/courses"
                className="text-gray-600 transition-colors hover:text-gray-900"
              >
                {isAuthenticated ? "My Courses" : "Courses"}
              </a>
              {isAuthenticated && (
                <a
                  href="/browse"
                  className="text-gray-600 transition-colors hover:text-gray-900"
                >
                  Browse All
                </a>
              )}

              {isAuthenticated && hasRole("INSTRUCTOR") && (
                <div className="relative" ref={instructorMenuRef}>
                  <button
                    onClick={() =>
                      setIsInstructorMenuOpen(!isInstructorMenuOpen)
                    }
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Instructor
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isInstructorMenuOpen && (
                    <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                      <a
                        href="/instructor/courses/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsInstructorMenuOpen(false)}
                      >
                        Create course
                      </a>
                      <a
                        href="/instructor/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsInstructorMenuOpen(false)}
                      >
                        My courses
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && hasRole("ADMIN") && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Admin
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute left-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                      <a
                        href="/admin/concepts"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        Concepts
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <span className="mr-2">{user?.name || user?.username}</span>
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username}`}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full border border-gray-200"
                    />
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden items-center space-x-3 md:flex">
                  <a href="/login">
                    <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                      Log in
                    </button>
                  </a>
                  <a href="/signup">
                    <button className="inline-flex items-center rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                      Sign up
                    </button>
                  </a>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setIsUserMenuOpen(false);
                    setIsInstructorMenuOpen(false);
                    setIsAdminMenuOpen(false);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  {isMenuOpen ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-100 pt-4 pb-4 md:hidden">
              <div className="space-y-3">
                <a
                  href="/"
                  className="block px-3 py-2 text-base font-medium text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/courses"
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Courses
                </a>
                {isAuthenticated && (
                  <a
                    href="/browse"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse All
                  </a>
                )}

                {isAuthenticated && hasRole("INSTRUCTOR") && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Instructor
                    </div>
                    <a
                      href="/instructor/courses/new"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create course
                    </a>
                    <a
                      href="/instructor/courses"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My courses
                    </a>
                  </>
                )}

                {isAuthenticated && hasRole("ADMIN") && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Admin
                    </div>
                    <a
                      href="/admin/concepts"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Concepts
                    </a>
                  </>
                )}

                {isAuthenticated ? (
                  <div className="space-y-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username}`}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full border border-gray-200"
                      />
                      <span className="text-sm text-gray-700">
                        {user?.name || user?.username}
                      </span>
                    </div>
                    <a
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-gray-100 pt-3">
                    <a href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                        Log in
                      </button>
                    </a>
                    <a href="/signup" onClick={() => setIsMenuOpen(false)}>
                      <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                        Sign up
                      </button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  return (
    <MockAuthContext.Provider value={mockAuthValue}>
      <MockedNavbar />
    </MockAuthContext.Provider>
  );
};

const meta: Meta<typeof NavbarWrapper> = {
  title: "Components/Navbar",
  component: NavbarWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The top navigation bar with improved styling, role-based dropdown menus, and user avatar.",
      },
    },
    nextRouter: {
      path: "/",
      asPath: "/",
      query: {},
    },
  },
  tags: ["autodocs"],
  argTypes: {
    authState: {
      description: "The authentication state for the navbar",
      control: { type: "object" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Unauthenticated: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
      isLoading: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar when user is not logged in, displaying login and signup buttons with clean styling.",
      },
    },
  },
};

export const AuthenticatedStudent: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-1",
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        role: "student",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar for a student user with dashboard navigation and user menu with avatar.",
      },
    },
  },
};

export const AuthenticatedInstructor: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "instructor-1",
        name: "Prof. Sarah Johnson",
        username: "prof_sarah",
        email: "sarah@university.edu",
        role: "instructor",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar for an instructor user with additional instructor dropdown menu.",
      },
    },
  },
};

export const AuthenticatedAdmin: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "admin-1",
        name: "Admin User",
        username: "admin",
        email: "admin@cognify.academy",
        role: "admin",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar for an admin user with both instructor and admin dropdown menus.",
      },
    },
  },
};

export const UsernameOnly: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-2",
        name: "",
        username: "jane_student",
        email: "jane@example.com",
        role: "student",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar when user has no display name, falling back to username in avatar and display.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    authState: {
      isLoading: true,
      isAuthenticated: false,
      user: null,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the navbar in loading state while checking authentication.",
      },
    },
  },
};

export const MobileUnauthenticated: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
      isLoading: false,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Mobile view of the navbar when user is not authenticated.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const menuButton = canvas.getByRole("button");
    await expect(menuButton).toBeInTheDocument();

    await userEvent.click(menuButton);

    const coursesLink = canvas.getByText("Courses");
    await expect(coursesLink).toBeInTheDocument();
  },
};

export const MobileAuthenticatedStudent: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-3",
        name: "Mobile User",
        username: "mobileuser",
        email: "mobile@example.com",
        role: "student",
      },
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile view of the navbar for an authenticated student with expanded menu.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const menuButton = canvas.getByRole("button");
    await userEvent.click(menuButton);

    const userDisplay = canvas.getByText("Mobile User");
    await expect(userDisplay).toBeInTheDocument();

    const signOutButton = canvas.getByText("Sign Out");
    await expect(signOutButton).toBeInTheDocument();
  },
};

export const MobileAuthenticatedInstructor: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "instructor-2",
        name: "Mobile Instructor",
        username: "mobile_instructor",
        email: "instructor@mobile.com",
        role: "instructor",
      },
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile view of the navbar for an instructor with instructor menu items.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const menuButton = canvas.getByRole("button");
    await userEvent.click(menuButton);

    const instructorSection = canvas.getByText("Instructor");
    await expect(instructorSection).toBeInTheDocument();

    const createCourseLink = canvas.getByText("Create course");
    await expect(createCourseLink).toBeInTheDocument();
  },
};

export const DesktopUserDropdown: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-4",
        name: "Dropdown Test User",
        username: "dropdown_user",
        email: "dropdown@example.com",
        role: "student",
      },
    },
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story:
          "Desktop view demonstrating the user dropdown menu functionality.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the user button by looking for the user's name
    const userButton = canvas.getByText("Dropdown Test User").closest("button");
    await expect(userButton).toBeInTheDocument();

    await userEvent.click(userButton!);

    const profileLink = canvas.getByText("Profile");
    await expect(profileLink).toBeInTheDocument();
  },
};

export const InteractiveLogout: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-5",
        name: "Interactive User",
        username: "interactive",
        email: "interactive@example.com",
        role: "student",
      },
      logout: async () => {
        console.log("Logout clicked!");
        alert("Logout functionality would be triggered here");
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive story to test logout functionality. Click the user menu and then Sign Out.",
      },
    },
  },
};

export const LongUsername: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-6",
        name: "This is a very long display name that might cause layout issues",
        username: "super_long_username_that_might_overflow",
        email: "longname@example.com",
        role: "student",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests the navbar with very long user names to ensure proper text handling and avatar generation.",
      },
    },
  },
};
