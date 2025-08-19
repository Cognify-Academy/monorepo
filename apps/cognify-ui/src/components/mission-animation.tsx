import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./mission-animation.css";

interface LineCoordinate {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface RelatedIdeaData {
  label: string;
  className: string;
  delay: string;
}

export default function MissionAnimation() {
  // Use refs to get direct access to the DOM elements of your nodes
  const coreConceptRef = useRef<HTMLDivElement>(null);
  const relatedIdeaRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [lineCoordinates, setLineCoordinates] = useState<LineCoordinate[]>([]);

  // Node data with initial positioning classes (Tailwind)
  const relatedIdeasData = useMemo<RelatedIdeaData[]>(
    () => [
      {
        label: "Related Idea 1",
        className: "bg-green-500 top-10 left-10",
        delay: "0.5s",
      },
      {
        label: "Related Idea 2",
        className: "bg-purple-500 top-20 right-10",
        delay: "1s",
      },
      {
        label: "Related Idea 3",
        className: "bg-yellow-500 bottom-10 left-20",
        delay: "1.5s",
      },
      {
        label: "Related Idea 4",
        className: "bg-red-500 bottom-20 right-20",
        delay: "2s",
      },
    ],
    [],
  );

  // This function calculates line coordinates based on node positions
  const updateLines = useCallback(() => {
    if (!coreConceptRef.current) return;

    const newLines: LineCoordinate[] = [];
    const coreRect = coreConceptRef.current.getBoundingClientRect();
    // Get the center of the core concept node relative to the SVG container
    // You'll need to adjust these for the parent container's offset later
    const coreX = coreRect.left + coreRect.width / 2;
    const coreY = coreRect.top + coreRect.height / 2;

    relatedIdeasData.forEach((_, index) => {
      const relatedRef = relatedIdeaRefs.current[index];
      if (relatedRef) {
        const relatedRect = relatedRef.getBoundingClientRect();
        const relatedX = relatedRect.left + relatedRect.width / 2;
        const relatedY = relatedRect.top + relatedRect.height / 2;

        // For SVG coordinates, we need values relative to the SVG container.
        // Assuming the SVG container is the direct parent of the nodes,
        // we can use the `offsetLeft` and `offsetTop` of the parent,
        // or calculate relative to the common ancestor if needed.
        // For simplicity, let's assume direct positions and correct within SVG later
        // This is a common challenge with mixing HTML and SVG positioning.

        // A better approach for relative positioning:
        // Get the SVG element's position
        const svgElement = document.querySelector(
          ".mission-animation-container svg",
        ) as SVGElement;
        const svgRect = svgElement.getBoundingClientRect();

        newLines.push({
          x1: coreX - svgRect.left, // X relative to SVG
          y1: coreY - svgRect.top, // Y relative to SVG
          x2: relatedX - svgRect.left, // X relative to SVG
          y2: relatedY - svgRect.top, // Y relative to SVG
        });
      }
    });
    setLineCoordinates(newLines);
  }, [relatedIdeasData]); // Re-run if relatedIdeasData changes

  // Use useEffect to run updateLines on mount and when component re-renders
  // And use requestAnimationFrame for smooth animation updates
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      updateLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate);

    // Clean up the animation frame on component unmount
    return () => cancelAnimationFrame(animationFrameId);
  }, [updateLines]); // Dependency on updateLines ensures it re-runs if updateLines itself changes

  return (
    <div className="mission-animation-container relative flex h-80 items-center justify-center">
      <div
        ref={coreConceptRef} // Attach ref to core concept node
        className="float-animation absolute z-10 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-center text-lg font-bold text-white shadow-lg"
      >
        Core Concept
      </div>

      {relatedIdeasData.map(({ label, className, delay }, index) => (
        <div
          key={label}
          ref={(el: HTMLDivElement | null) =>
            (relatedIdeaRefs.current[index] = el)
          } // Attach refs to related ideas
          className={`pulse-animation float-animation absolute z-0 flex h-16 w-16 items-center justify-center rounded-full text-center text-xs text-white shadow ${className}`}
          style={{ animationDelay: delay }}
        >
          {label}
        </div>
      ))}

      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
        {lineCoordinates.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#cbd5e1"
            strokeWidth="2"
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  );
}
