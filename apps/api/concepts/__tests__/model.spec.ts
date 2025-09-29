import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";
import {
  createConcept,
  deleteConcept,
  getConcept,
  getConcepts,
  importConcepts,
  updateConcept,
} from "../model";

const mockConcept1 = {
  id: "someuuid",
  name: "Test Concept",
  slug: "test-concept",
  description: "This is a test concept",
  importance: 500,
  conceptSource: [],
  conceptTarget: [],
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
};

const mockConcept2 = {
  id: "someuuid2",
  name: "Test Concept 2",
  slug: "test-concept-2",
  description: "This is a test concept",
  importance: 500,
  conceptSource: [],
  conceptTarget: [],
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
};

const mockCreate = mock(() => mockConcept1);
const mockFindUnique = mock(() => mockConcept1);
const mockFindMany = mock(() => [mockConcept1, mockConcept2]);

const mockUpsertConcept = jest.fn();

prisma.concept.create = mockCreate as any;
prisma.concept.findUnique = mockFindUnique as any;
prisma.concept.findMany = mockFindMany as any;
prisma.concept.upsert = mockUpsertConcept as any;

const mockUpsertConceptRelation = jest.fn();
prisma.conceptRelation.upsert = mockUpsertConceptRelation as any;

const mockDelete = mock(() => ({
  id: "concept-a-id",
  name: "Test Concept",
  slug: "test-concept",
  description: "This is a test concept",
  importance: 500,
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));
prisma.concept.delete = mockDelete as any;

const mockUpdate = mock(() => ({
  id: "concept-a-id",
  name: "Updated Concept",
  slug: "test-concept",
  description: "This is a test concept",
  importance: 500,
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));
prisma.concept.update = mockUpdate as any;

afterEach(() => {
  jest.restoreAllMocks();
  mockUpsertConcept.mockClear();
  mockUpsertConceptRelation.mockClear();
  mockDelete.mockClear();
  mockUpdate.mockClear();
});

describe("Concepts", () => {
  describe("Create Concept", () => {
    test("creating a new concept without a valid importance should throw", async () => {
      expect(() =>
        createConcept({
          name: "Test Concept",
          description: "This is a test concept",
          importance: 1000,
        }),
      ).toThrowError(
        "Importance must be one of 100, 101, 102, 200, 201, 202, 300, 301, 302, 400, 401, 402, 500, 501, 502. See /api/concepts/importances for more information.",
      );
    });

    test("creating a new concept should return the concept", async () => {
      const res = await createConcept({
        name: "Test Concept",
        description: "This is a test concept",
        importance: 500,
      });
      expect(res).toEqual(mockConcept1);
    });
  });

  describe("Get Concepts", () => {
    test("get all concepts", async () => {
      const res = await getConcepts();
      expect(res).toEqual([mockConcept1, mockConcept2]);
    });
  });

  describe("Get Concept", () => {
    test("get a concept by name", async () => {
      const res = await getConcept("Test Concept");
      expect(res).toEqual(mockConcept1);
    });

    test("should return null if concept is not found", async () => {
      mockFindUnique.mockImplementation(() => null as any);
      const res = await getConcept("non-existent-concept");
      expect(res).toBeNull();
    });
  });

  describe("importConcepts", () => {
    test("should create and update concepts correctly", async () => {
      mockUpsertConcept.mockImplementation(({ where }) => ({
        id: where.id,
        slug: where.id === "concept-a-id" ? "concept-a" : "concept-b",
        ...where,
      }));

      const concepts = [
        {
          id: "concept-a-id",
          name: "Concept A",
          description: "Description A",
          importance: 100,
          conceptSource: [],
        },
        {
          id: "concept-b-id",
          name: "Concept B",
          description: "Description B",
          importance: 200,
          conceptSource: [
            {
              id: "relation-a-to-b",
              conceptSourceId: "concept-b-id",
              conceptTargetId: "concept-a-id",
              description: "A to B",
              weighting: 0.8,
            },
          ],
        },
      ];

      await importConcepts(concepts);

      expect(mockUpsertConcept).toHaveBeenCalledTimes(2);
      expect(mockUpsertConcept).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "concept-a-id" } }),
      );
      expect(mockUpsertConcept).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "concept-b-id" } }),
      );
    });

    test("should create relations correctly", async () => {
      mockUpsertConcept.mockImplementation(({ where }) => ({
        id: where.id,
      }));
      mockUpsertConceptRelation.mockImplementation(() => ({
        id: "relation-id",
      }));

      const concepts = [
        {
          id: "concept-a-id",
          name: "Concept A",
          description: "Description A",
          importance: 100,
          conceptSource: [],
        },
        {
          id: "concept-b-id",
          name: "Concept B",
          description: "Description B",
          importance: 200,
          conceptSource: [
            {
              id: "relation-a-to-b",
              conceptSourceId: "concept-b-id",
              conceptTargetId: "concept-a-id",
              description: "A to B",
              weighting: 0.8,
            },
          ],
        },
      ];

      await importConcepts(concepts);

      expect(mockUpsertConceptRelation).toHaveBeenCalledTimes(1);
      expect(mockUpsertConceptRelation).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            unique_edge: {
              conceptSourceId: "concept-b-id",
              conceptTargetId: "concept-a-id",
            },
          },
        }),
      );
    });

    test("should not create relations if concept is missing", async () => {
      mockUpsertConcept.mockImplementation(({ where }) =>
        where.id === "concept-b-id" ? { id: "concept-b-id" } : null,
      );
      mockUpsertConceptRelation.mockImplementation(() => ({
        id: "relation-id",
      }));

      const concepts = [
        {
          id: "concept-b-id",
          name: "Concept B",
          description: "Description B",
          importance: 200,
          conceptSource: [
            {
              id: "relation-b-to-c",
              conceptSourceId: "concept-b-id",
              conceptTargetId: "concept-c-id",
              description: "B to C",
              weighting: 0.8,
            },
          ],
        },
      ];

      await importConcepts(concepts);

      expect(mockUpsertConceptRelation).not.toHaveBeenCalled();
    });

    test("should throw when there is an upsert error in concept source", async () => {
      mockUpsertConcept.mockImplementationOnce(() => {
        throw new Error("Upsert error");
      }) as any;

      const concepts = [
        {
          id: "concept-a-id",
          name: "Concept A",
          description: "Description A",
          importance: 100,
          conceptSource: [],
        },
      ];

      await expect(importConcepts(concepts)).rejects.toThrow("Upsert error");
    });

    test("should throw when there is an upsert error in concept target", async () => {
      mockUpsertConcept.mockImplementationOnce(() => {
        throw new Error("Upsert error");
      }) as any;

      const concepts = [
        {
          id: "concept-a-id",
          name: "Concept A",
          description: "Description A",
          importance: 100,
          conceptSource: [],
          conceptTarget: [],
        },
      ];

      expect(importConcepts(concepts)).rejects.toThrow("Upsert error");
    });
  });

  describe("Update Concept", () => {
    test("should update a concept", async () => {
      const res = await updateConcept({
        id: "concept-a-id",
        name: "Updated Concept",
        description: "This is a test concept",
        importance: 500,
      });
      expect(res).toEqual({
        id: "concept-a-id",
        name: "Updated Concept",
        slug: "test-concept",
        description: "This is a test concept",
        importance: 500,
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      });
    });

    test("should throw when updating with an invalid importance", async () => {
      expect(
        updateConcept({
          id: "concept-a-id",
          name: "Updated Concept",
          description: "This is a test concept",
          importance: 1000,
        }),
      ).rejects.toThrow(
        "Importance must be one of 100, 101, 102, 200, 201, 202, 300, 301, 302, 400, 401, 402, 500, 501, 502. See /api/concepts/importances for more information.",
      );
    });
  });

  describe("Delete Concept", () => {
    test("should delete a concept", async () => {
      const res = await deleteConcept("concept-a-id");
      expect(res).toEqual({
        id: "concept-a-id",
        name: "Test Concept",
        slug: "test-concept",
        description: "This is a test concept",
        importance: 500,
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      });
    });
  });
});
