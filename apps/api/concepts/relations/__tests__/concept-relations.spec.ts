import { describe, expect, mock, test } from "bun:test";
import prisma from "../../../prisma";
import { relateConcepts, deleteRelation, patchRelation } from "../model";

describe("Relate Concepts", () => {
  test("relate two concepts", async () => {
    const mockConceptRelationCreate = mock(() => ({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "This is a test relation",
      weighting: 0.5,

      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    }));
    prisma.conceptRelation.create = mockConceptRelationCreate as any;

    const res = await relateConcepts({
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "This is a test relation",
      weighting: 0.5,
    });
    expect(res).toEqual({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "This is a test relation",
      weighting: 0.5,

      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    });
  });

  test("relate two concepts with invalid concept ids should throw", async () => {
    const mockConceptRelationCreate = mock(() => {
      throw { code: "P2003", message: "Invalid concept ids" };
    });
    prisma.conceptRelation.create = mockConceptRelationCreate as any;

    expect(() =>
      relateConcepts({
        conceptSourceId: "someuuid",
        conceptTargetId: "someuuid2",
        description: "This is a test relation",
        weighting: 0.5,
      }),
    ).toThrowError("One or both concepts do not exist");
  });

  test("relate two concepts with an unknown error should throw", async () => {
    const mockConceptRelationCreate = mock(() => {
      throw new Error("Failed to relate concepts");
    });
    prisma.conceptRelation.create = mockConceptRelationCreate as any;

    expect(() =>
      relateConcepts({
        conceptSourceId: "someuuid",
        conceptTargetId: "someuuid2",
        description: "This is a test relation",
        weighting: 0.5,
      }),
    ).toThrowError("Failed to relate concepts");
  });
});

describe("Delete Relation", () => {
  test("delete relation successfully", async () => {
    const mockConceptRelationDelete = mock(() => ({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "This is a test relation",
      weighting: 0.5,
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    }));
    prisma.conceptRelation.delete = mockConceptRelationDelete as any;

    const res = await deleteRelation("someuuid");
    expect(res).toEqual({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "This is a test relation",
      weighting: 0.5,
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    });
    expect(mockConceptRelationDelete).toHaveBeenCalledWith({
      where: { id: "someuuid" },
    });
  });

  test("delete relation with error should throw", async () => {
    const mockConceptRelationDelete = mock(() => {
      throw new Error("Database error");
    });
    prisma.conceptRelation.delete = mockConceptRelationDelete as any;

    expect(() => deleteRelation("someuuid")).toThrowError(
      "Failed to delete relation",
    );
  });
});

describe("Patch Relation", () => {
  test("patch relation successfully", async () => {
    const mockConceptRelationUpdate = mock(() => ({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "Updated description",
      weighting: 0.8,
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    }));
    prisma.conceptRelation.update = mockConceptRelationUpdate as any;

    const res = await patchRelation({
      id: "someuuid",
      weighting: 0.8,
      description: "Updated description",
    });

    expect(res).toEqual({
      id: "someuuid",
      conceptSourceId: "someuuid",
      conceptTargetId: "someuuid2",
      description: "Updated description",
      weighting: 0.8,
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    });
    expect(mockConceptRelationUpdate).toHaveBeenCalledWith({
      where: { id: "someuuid" },
      data: {
        weighting: 0.8,
        description: "Updated description",
      },
    });
  });

  test("patch relation with error should throw", async () => {
    const mockConceptRelationUpdate = mock(() => {
      throw new Error("Database error");
    });
    prisma.conceptRelation.update = mockConceptRelationUpdate as any;

    expect(() =>
      patchRelation({
        id: "someuuid",
        weighting: 0.8,
        description: "Updated description",
      }),
    ).toThrowError("Failed to update relation");
  });
});
