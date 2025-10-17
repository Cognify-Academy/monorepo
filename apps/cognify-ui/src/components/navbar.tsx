"use client";

import { Button } from "@/components/button";
import { useAuth } from "@/contexts/auth";
import { ChevronDownIcon } from "@/icons/chevron-down-icon";
import { CloseIcon } from "@/icons/close-icon";
import { LogoutIcon } from "@/icons/logout-icon";
import { MenuIcon } from "@/icons/menu-icon";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInstructorMenuOpen, setIsInstructorMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const instructorMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsInstructorMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  useEffect(() => {
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

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsInstructorMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  return (
    <nav className="relative z-50 border-b border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500">
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
            <Link
              href="/"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Cognify Academy
            </Link>
          </div>

          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden space-x-8 md:flex">
            <Link
              href="/courses"
              className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Courses
            </Link>

            {isAuthenticated && hasRole("INSTRUCTOR") && (
              <div className="relative" ref={instructorMenuRef}>
                <button
                  onClick={() => setIsInstructorMenuOpen(!isInstructorMenuOpen)}
                  className="flex items-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Instructor
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
                {isInstructorMenuOpen && (
                  <div className="absolute left-0 z-10 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                    <Link
                      href="/instructor/courses/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setIsInstructorMenuOpen(false)}
                    >
                      Create course
                    </Link>
                    <Link
                      href="/instructor/courses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setIsInstructorMenuOpen(false)}
                    >
                      My courses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && hasRole("ADMIN") && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="flex items-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Admin
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
                {isAdminMenuOpen && (
                  <div className="absolute left-0 z-10 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                    <Link
                      href="/admin/concepts"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Concepts
                    </Link>
                    <Link
                      href="/admin/contacts"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - user menu and mobile button */}
          <div className="flex items-center space-x-4">
            {/* Desktop user menu - hidden on mobile */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    data-testid="user-menu"
                  >
                    <span className="mr-2">{user?.name || user?.username}</span>
                    <Image
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username}`}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-600"
                    />
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {isAuthenticated && (
                        <Link
                          href="/courses/enrolled"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Courses
                        </Link>
                      )}
                      {isAuthenticated && (
                        <Link
                          href="/concepts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Concepts
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        data-testid="logout-button"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button>Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button - always visible on mobile */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white md:hidden"
              aria-label="Toggle mobile menu"
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-gray-100 pb-4 pt-4 dark:border-gray-700 md:hidden">
            <div className="space-y-3">
              <Link
                href="/courses"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={closeAllMenus}
              >
                Courses
              </Link>

              {isAuthenticated && hasRole("INSTRUCTOR") && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Instructor
                  </div>
                  <Link
                    href="/instructor/courses/new"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    Create course
                  </Link>
                  <Link
                    href="/instructor/courses"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    My courses
                  </Link>
                </>
              )}

              {isAuthenticated && hasRole("ADMIN") && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Admin
                  </div>
                  <Link
                    href="/admin/concepts"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    Concepts
                  </Link>
                  <Link
                    href="/admin/contacts"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    Contact
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <Image
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.username}`}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {user?.name || user?.username}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/courses/enrolled"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={closeAllMenus}
                  >
                    My Courses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    data-testid="logout-button"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <Link href="/login" onClick={closeAllMenus}>
                    <Button className="w-full">Log in</Button>
                  </Link>
                  <Link href="/signup" onClick={closeAllMenus}>
                    <Button className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
