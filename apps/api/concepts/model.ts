import prisma from "../prisma";
import { importances } from "./importances";
import slugify from "slugify";

export async function getConcepts() {
  console.debug("Fetching all concepts");
  const concepts = await prisma.concept.findMany({
    include: { conceptSource: true, conceptTarget: true },
  });
  console.debug(`Retrieved ${concepts.length} concepts`);
  return concepts;
}

export async function getConcept(slug: string) {
  console.debug(`Fetching concept with slug: ${slug}`);
  const concept = await prisma.concept.findUnique({
    where: { slug },
    include: { conceptSource: true, conceptTarget: true },
  });
  if (concept) {
    console.debug(`Found concept: ${concept.name} (${concept.id})`);
  } else {
    console.debug(`Concept not found for slug: ${slug}`);
  }
  return concept;
}

export async function importConcepts(
  concepts: {
    id: string;
    name: string;
    slug?: string;
    description: string;
    importance: number;
    conceptSource?: {
      id: string;
      conceptSourceId: string;
      conceptTargetId: string;
      description: string;
      weighting: number;
    }[];
    conceptTarget?: {
      id: string;
      conceptSourceId: string;
      conceptTargetId: string;
      description: string;
      weighting: number;
    }[];
  }[],
) {
  const createdConcepts = new Map();

  try {
    let numberInserted = 0;
    for (const concept of concepts) {
      const slug = concept.slug || slugify(concept.name, { lower: true });
      const createdConcept = await prisma.concept.upsert({
        where: { id: concept.id },
        update: {
          description: concept.description,
          importance: concept.importance,
        },
        create: {
          id: concept.id,
          name: concept.name,
          slug,
          description: concept.description,
          importance: concept.importance,
        },
      });
      createdConcepts.set(concept.id, createdConcept.id);
      numberInserted++;
    }
    console.debug("Inserted " + numberInserted + " records");
  } catch (error) {
    console.error("Error inserting concepts", error);
    throw error;
  }

  console.debug("Inserting relations");
  try {
    let createdRelations = 0;
    for (const concept of concepts) {
      for (const relation of concept.conceptSource ?? []) {
        if (
          !createdConcepts.has(relation.conceptSourceId) ||
          !createdConcepts.has(relation.conceptTargetId)
        )
          continue;

        await prisma.conceptRelation.upsert({
          where: {
            unique_edge: {
              conceptSourceId: relation.conceptSourceId,
              conceptTargetId: relation.conceptTargetId,
            },
          },
          update: {
            description: relation.description,
            weighting: relation.weighting,
          },
          create: {
            id: relation.id,
            conceptSourceId: relation.conceptSourceId,
            conceptTargetId: relation.conceptTargetId,
            description: relation.description,
            weighting: relation.weighting,
          },
        });
        createdRelations++;
      }

      for (const relation of concept.conceptTarget ?? []) {
        await prisma.conceptRelation.upsert({
          where: {
            unique_edge: {
              conceptSourceId: relation.conceptSourceId,
              conceptTargetId: relation.conceptTargetId,
            },
          },
          update: {
            description: relation.description,
            weighting: relation.weighting,
          },
          create: {
            id: relation.id,
            conceptSourceId: relation.conceptSourceId,
            conceptTargetId: relation.conceptTargetId,
            description: relation.description,
            weighting: relation.weighting,
          },
        });
        createdRelations++;
      }
    }
    console.debug("Inserted " + createdRelations + " relations");
  } catch (error) {
    console.error("Error updating relations", error);
    throw error;
  }
  return { message: "Concepts imported successfully!" };
}

export async function createConcept({
  name,
  description,
  importance,
}: {
  name: string;
  description: string;
  importance: number;
}) {
  if (!(importance in importances)) {
    throw new Error(
      `Importance must be one of ${Object.keys(importances).join(", ")}. See /api/concepts/importances for more information.`,
    );
  }
  console.debug("createConcept", { name, description, importance });
  try {
    const concept = await prisma.concept.create({
      data: {
        name,
        description,
        importance,
        slug: slugify(name, { lower: true }),
      },
    });
    return concept;
  } catch (error) {
    console.error(`Failed to create concept: ${name}`, error);
    throw error;
  }
}

export async function updateConcept({
  id,
  name,
  description,
  importance,
}: {
  id: string;
  name: string;
  description: string;
  importance: number;
}) {
  if (!(importance in importances)) {
    throw new Error(
      `Importance must be one of ${Object.keys(importances).join(", ")}. See /api/concepts/importances for more information.`,
    );
  }
  console.debug("updateConcept", { id, name, description, importance });
  try {
    const concept = await prisma.concept.update({
      where: { id },
      data: { name, description, importance },
    });
    return concept;
  } catch (error) {
    console.error(`Failed to update concept: ${id}`, error);
    throw error;
  }
}

export async function deleteConcept(id: string) {
  console.debug(`deleting concept ${id}`);
  try {
    const concept = await prisma.concept.delete({
      where: { id },
    });
    return concept;
  } catch (error) {
    console.error(`Failed to delete concept: ${id}`, error);
    throw error;
  }
}
