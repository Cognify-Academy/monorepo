"use client";

import Dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import { ViewConceptDialog } from "./concept-dialogs/view-concept-dialog";

interface Concept {
  id: string;
  name: string;
  slug: string;
  description: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  conceptSource: Array<{
    id: string;
    conceptSourceId: string;
    conceptTargetId: string;
    description: string;
    weighting?: number;
  }>;
  conceptTarget: Array<{
    id: string;
    conceptSourceId: string;
    conceptTargetId: string;
    description: string;
    weighting?: number;
  }>;
  completedLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    completedAt?: string | null;
  }>;
}

function generateNode(concept: Concept, index: number) {
  return {
    id: concept.id,
    type: "default",
    position: {
      x: (index % 5) * 200,
      y: 500 - concept.importance,
    },
    data: {
      label: concept.name,
      description: concept.description,
      importance: concept.importance,
      completedLessons: concept.completedLessons,
    },
    style: {
      backgroundColor: `rgba(0, 150, 255, ${concept.importance / 1000})`,
      width: 150,
      height: 50,
    },
  };
}

function extractEdgesFromConcepts(concepts: Concept[]): Edge[] {
  const edges: Edge[] = [];
  const processedEdges = new Set(); // To avoid duplicate edges

  concepts.forEach((concept) => {
    // Process outgoing edges (where this concept is the source)
    if (concept.conceptSource && Array.isArray(concept.conceptSource)) {
      concept.conceptSource.forEach((relation) => {
        const edgeId = String(relation.id);
        if (!processedEdges.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: String(relation.conceptSourceId),
            target: String(relation.conceptTargetId),
            data: {
              label: relation.description || "",
              weighting: relation.weighting || 0.5,
            },
          });
          processedEdges.add(edgeId);
        }
      });
    }

    // Process incoming edges (where this concept is the target)
    if (concept.conceptTarget && Array.isArray(concept.conceptTarget)) {
      concept.conceptTarget.forEach((relation) => {
        const edgeId = String(relation.id);
        if (!processedEdges.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: String(relation.conceptSourceId),
            target: String(relation.conceptTargetId),
            data: {
              label: relation.description || "",
              weighting: relation.weighting || 0.5,
            },
          });
          processedEdges.add(edgeId);
        }
      });
    }
  });

  return edges;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: string },
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge: Edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node: Node) => {
    if (typeof node !== "string") {
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      });
    }
  });

  Dagre.layout(g);

  return {
    nodes: nodes.map((node: Node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y }, data: node.data || { label: "" } };
    }),
    edges,
  };
};

function LayoutFlow({ concepts }: { concepts: Concept[] }) {
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesState] = useEdgesState<Edge>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (concepts.length > 0) {
      const conceptNodes = concepts.map((concept, index) =>
        generateNode(concept, index),
      );
      const conceptEdges = extractEdgesFromConcepts(concepts);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(conceptNodes, conceptEdges, { direction: "TB" });

      setNodes(layoutedNodes.map((n) => ({ ...n, id: String(n.id) })));
      setEdges(layoutedEdges);
      window.requestAnimationFrame(() => fitView());
    }
  }, [concepts, fitView, setNodes, setEdges]);

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, { direction });
      setNodes(
        layoutedNodes.map((node) => ({
          ...node,
          id: String(node.id),
        })),
      );
      setEdges([...layoutedEdges]);
      window.requestAnimationFrame(() => fitView());
    },
    [nodes, edges, fitView, setNodes, setEdges],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const concept = concepts.find((c) => c.id === node.id);
      if (concept) {
        setSelectedConcept(concept);
        setIsDialogOpen(true);
      }
    },
    [concepts],
  );

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesState}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <MiniMap />
        <Controls />
        <Panel position="top-right">
          <Button onClick={() => onLayout("TB")}>Vertical Layout</Button>
          <Button onClick={() => onLayout("LR")}>Horizontal Layout</Button>
        </Panel>
      </ReactFlow>

      <ViewConceptDialog
        concept={selectedConcept}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedConcept(null);
        }}
      />
    </div>
  );
}

function ConceptGraphViewer({ concepts }: { concepts: Concept[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Concept Graph...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <LayoutFlow concepts={concepts} />
    </ReactFlowProvider>
  );
}

export { ConceptGraphViewer };
