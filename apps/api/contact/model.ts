import prisma from "../prisma";

export interface CreateContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createContact(data: CreateContactData) {
  console.debug("Creating new contact submission", {
    email: data.email,
    subject: data.subject,
  });

  try {
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "PENDING", // Default status
      },
    });

    console.log(`Contact submission created: ${contact.id} from ${data.email}`);
    return contact;
  } catch (error) {
    console.error("Failed to create contact submission:", error);
    throw new Error("Failed to submit contact form");
  }
}

export async function getContacts() {
  console.debug("Fetching all contact submissions");

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.debug(`Retrieved ${contacts.length} contact submissions`);
    return contacts;
  } catch (error) {
    console.error("Failed to fetch contact submissions:", error);
    throw new Error("Failed to fetch contact submissions");
  }
}

export async function getContact(id: string) {
  console.debug(`Fetching contact submission: ${id}`);

  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      console.debug(`Contact submission not found: ${id}`);
      return null;
    }

    console.debug(`Found contact submission: ${id}`);
    return contact;
  } catch (error) {
    console.error(`Failed to fetch contact submission ${id}:`, error);
    throw new Error("Failed to fetch contact submission");
  }
}

export async function updateContactStatus(
  id: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED",
) {
  console.debug(`Updating contact submission ${id} status to: ${status}`);

  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    console.log(`Contact submission ${id} status updated to: ${status}`);
    return contact;
  } catch (error) {
    console.error(`Failed to update contact submission ${id}:`, error);
    throw new Error("Failed to update contact submission");
  }
}
