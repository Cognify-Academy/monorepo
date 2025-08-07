import prisma from "../../prisma";

export async function relateConcepts({
  conceptSourceId,
  conceptTargetId,
  description,
  weighting,
}: {
  conceptSourceId: string;
  conceptTargetId: string;
  description: string;
  weighting: number;
}) {
  try {
    const result = await prisma.conceptRelation.create({
      data: {
        conceptSourceId,
        conceptTargetId,
        description,
        weighting,
      },
    });
    console.debug("relateConcepts", result);
    return result;
  } catch (error: any) {
    if (error.code === "P2003") {
      console.log("invalid concept ids", error.message);
      throw new Error("One or both concepts do not exist");
    }
    console.error(error);
    throw new Error("Failed to relate concepts");
  }
}

export async function deleteRelation(id: string) {
  try {
    const result = await prisma.conceptRelation.delete({
      where: { id },
    });
    console.debug("deleteRelation", result);
    return result;
  } catch (error: any) {
    console.error(error);
    throw new Error("Failed to delete relation");
  }
}

export async function patchRelation({
  id,
  weighting,
  description,
}: {
  id: string;
  weighting: number;
  description: string;
}) {
  try {
    const result = await prisma.conceptRelation.update({
      where: { id },
      data: {
        weighting,
        description,
      },
    });
    console.debug(`Updated relation: ${id}`);
    return result;
  } catch (error: any) {
    console.error(error);
    throw new Error("Failed to update relation");
  }
}
