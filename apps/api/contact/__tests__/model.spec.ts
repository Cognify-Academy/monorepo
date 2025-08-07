import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";
import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
} from "../model";
import type { CreateContactData } from "../model";

const mockCreateContact = mock(() => ({
  id: "contact-123",
  name: "John Doe",
  email: "john@example.com",
  subject: "Test Subject",
  message: "Test message content",
  status: "PENDING",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockFindManyContacts = mock(() => [
  {
    id: "contact-123",
    name: "John Doe",
    email: "john@example.com",
    subject: "Test Subject 1",
    message: "Test message content 1",
    status: "PENDING",
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
  },
  {
    id: "contact-456",
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Test Subject 2",
    message: "Test message content 2",
    status: "COMPLETED",
    createdAt: new Date("2025-03-16T10:30:00.000Z"),
    updatedAt: new Date("2025-03-16T10:30:00.000Z"),
  },
]);

const mockFindUniqueContact = mock(() => ({
  id: "contact-123",
  name: "John Doe",
  email: "john@example.com",
  subject: "Test Subject",
  message: "Test message content",
  status: "PENDING",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockUpdateContact = mock(() => ({
  id: "contact-123",
  name: "John Doe",
  email: "john@example.com",
  subject: "Test Subject",
  message: "Test message content",
  status: "COMPLETED",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

// Mock the Prisma client methods
prisma.contact.create = mockCreateContact as any;
prisma.contact.findMany = mockFindManyContacts as any;
prisma.contact.findUnique = mockFindUniqueContact as any;
prisma.contact.update = mockUpdateContact as any;

afterEach(() => {
  jest.restoreAllMocks();
  mockCreateContact.mockClear();
  mockFindManyContacts.mockClear();
  mockFindUniqueContact.mockClear();
  mockUpdateContact.mockClear();
});

describe("Contact Model", () => {
  describe("createContact", () => {
    const validContactData: CreateContactData = {
      name: "John Doe",
      email: "john@example.com",
      subject: "Test Subject",
      message: "Test message content",
    };

    test("should create contact successfully", async () => {
      const result = await createContact(validContactData);

      expect(result).toEqual({
        id: "contact-123",
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message content",
        status: "PENDING",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      });

      expect(mockCreateContact).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test message content",
          status: "PENDING",
        },
      });
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database connection failed");
      mockCreateContact.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(createContact(validContactData)).rejects.toThrow(
        "Failed to submit contact form",
      );
    });

    test("should handle validation errors", async () => {
      const dbError = new Error("Validation failed");
      mockCreateContact.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(createContact(validContactData)).rejects.toThrow(
        "Failed to submit contact form",
      );
    });

    test("should create contact with different data", async () => {
      const differentData: CreateContactData = {
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Different Subject",
        message: "Different message content",
      };

      await createContact(differentData);

      expect(mockCreateContact).toHaveBeenCalledWith({
        data: {
          name: "Jane Smith",
          email: "jane@example.com",
          subject: "Different Subject",
          message: "Different message content",
          status: "PENDING",
        },
      });
    });
  });

  describe("getContacts", () => {
    test("should return all contacts ordered by creation date", async () => {
      const result = await getContacts();

      expect(result).toEqual([
        {
          id: "contact-123",
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject 1",
          message: "Test message content 1",
          status: "PENDING",
          createdAt: new Date("2025-03-17T15:52:12.689Z"),
          updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        },
        {
          id: "contact-456",
          name: "Jane Smith",
          email: "jane@example.com",
          subject: "Test Subject 2",
          message: "Test message content 2",
          status: "COMPLETED",
          createdAt: new Date("2025-03-16T10:30:00.000Z"),
          updatedAt: new Date("2025-03-16T10:30:00.000Z"),
        },
      ]);

      expect(mockFindManyContacts).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    test("should return empty array when no contacts found", async () => {
      mockFindManyContacts.mockImplementationOnce(() => []);

      const result = await getContacts();

      expect(result).toEqual([]);
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database query failed");
      mockFindManyContacts.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getContacts()).rejects.toThrow(
        "Failed to fetch contact submissions",
      );
    });
  });

  describe("getContact", () => {
    test("should return contact by id", async () => {
      const result = await getContact("contact-123");

      expect(result).toEqual({
        id: "contact-123",
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message content",
        status: "PENDING",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      });

      expect(mockFindUniqueContact).toHaveBeenCalledWith({
        where: { id: "contact-123" },
      });
    });

    test("should return null when contact not found", async () => {
      mockFindUniqueContact.mockImplementationOnce(() => null as any);

      const result = await getContact("nonexistent-contact");

      expect(result).toBeNull();
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database query failed");
      mockFindUniqueContact.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getContact("contact-123")).rejects.toThrow(
        "Failed to fetch contact submission",
      );
    });
  });

  describe("updateContactStatus", () => {
    test("should update contact status to COMPLETED", async () => {
      const result = await updateContactStatus("contact-123", "COMPLETED");

      expect(result).toEqual({
        id: "contact-123",
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message content",
        status: "COMPLETED",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      });

      expect(mockUpdateContact).toHaveBeenCalledWith({
        where: { id: "contact-123" },
        data: { status: "COMPLETED" },
      });
    });

    test("should update contact status to IN_PROGRESS", async () => {
      await updateContactStatus("contact-123", "IN_PROGRESS");

      expect(mockUpdateContact).toHaveBeenCalledWith({
        where: { id: "contact-123" },
        data: { status: "IN_PROGRESS" },
      });
    });

    test("should update contact status to ARCHIVED", async () => {
      await updateContactStatus("contact-123", "ARCHIVED");

      expect(mockUpdateContact).toHaveBeenCalledWith({
        where: { id: "contact-123" },
        data: { status: "ARCHIVED" },
      });
    });

    test("should update contact status to PENDING", async () => {
      await updateContactStatus("contact-123", "PENDING");

      expect(mockUpdateContact).toHaveBeenCalledWith({
        where: { id: "contact-123" },
        data: { status: "PENDING" },
      });
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database update failed");
      mockUpdateContact.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        updateContactStatus("contact-123", "COMPLETED"),
      ).rejects.toThrow("Failed to update contact submission");
    });

    test("should throw error when contact not found", async () => {
      const dbError = new Error("Record to update not found");
      mockUpdateContact.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        updateContactStatus("nonexistent-contact", "COMPLETED"),
      ).rejects.toThrow("Failed to update contact submission");
    });
  });
});
