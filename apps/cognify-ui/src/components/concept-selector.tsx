import { useState } from "react";
import { Badge } from "./badge";

export type ConceptType = {
  id: string;
  name: string;
  slug: string;
};

export type ConceptSelectorProps = {
  availableConcepts: ConceptType[];
  selectedConceptIds: string[];
  onChange: (selected: string[]) => void;
};

export function ConceptSelector({
  availableConcepts,
  selectedConceptIds,
  onChange,
}: ConceptSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredConcepts = availableConcepts.filter(
    (concept) =>
      concept.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedConceptIds?.includes(concept.id),
  );

  const addConcept = (id: string) => {
    onChange([...(selectedConceptIds || []), id]);
    setSearchTerm("");
  };

  const removeConcept = (id: string) => {
    onChange((selectedConceptIds || []).filter((cid) => cid !== id));
  };

  return (
    <div className="mt-2">
      <h4 className="font-medium text-gray-900 dark:text-white">Concepts:</h4>
      <div className="mb-4 space-y-4 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
        <div>
          <input
            type="text"
            placeholder="Search concepts..."
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isFocused && filteredConcepts.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
              {filteredConcepts.map((concept) => (
                <li
                  key={concept.id}
                  className="cursor-pointer p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                  onMouseDown={() => addConcept(concept.id)}
                >
                  {concept.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedConceptIds?.map((id) => {
            const concept = availableConcepts.find((c) => c.id === id);
            if (!concept) return null;
            return (
              <Badge
                key={id}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                variant="secondary"
                onClick={() => removeConcept(id)}
              >
                {concept.name} &times;
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
