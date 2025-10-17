"use client";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetailModal({
  contact,
  isOpen,
  onClose,
}: ContactDetailModalProps) {
  if (!isOpen || !contact) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Contact Information
            </h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900">{contact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{contact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      contact.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : contact.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : contact.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {contact.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Submitted
                  </label>
                  <p className="text-gray-900">
                    {formatDate(contact.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Subject
            </h3>
            <p className="rounded-lg bg-gray-50 p-4 text-gray-900">
              {contact.subject}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Message
            </h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-900">
                {contact.message}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(contact.email);
                alert("Email copied to clipboard!");
              }}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Copy Email
            </button>
            <button
              onClick={() => {
                window.open(
                  `mailto:${contact.email}?subject=Re: ${contact.subject}`,
                  "_blank",
                );
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Reply via Email
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
