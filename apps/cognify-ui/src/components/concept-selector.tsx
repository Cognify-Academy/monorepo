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
      <h4 className="font-medium">Concepts:</h4>
      <div className="mb-4 space-y-4 rounded-md border p-4">
        <div>
          <input
            type="text"
            placeholder="Search concepts..."
            className="w-full rounded-md border p-2 focus:outline-2 focus:outline-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isFocused && filteredConcepts.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border bg-white shadow-lg">
              {filteredConcepts.map((concept) => (
                <li
                  key={concept.id}
                  className="cursor-pointer p-2 hover:bg-gray-100"
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
                className="cursor-pointer hover:bg-gray-200"
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
