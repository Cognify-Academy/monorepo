"use client";

import { Button } from "@/components/button";
import { EditEdgeDialog } from "@/components/concept-dialogs/edit-edge-dialog";
import { EditNodeDialog } from "@/components/concept-dialogs/edit-node-dialog";
import { NewNodeDialog } from "@/components/concept-dialogs/new-node-dialog";
import Dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type OnConnect,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth";
import "@xyflow/react/dist/style.css";

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

interface Concept {
  id: string;
  importance: number;
  name: string;
  description: string;
  conceptSource?: ConceptRelation[];
  conceptTarget?: ConceptRelation[];
}

interface ConceptRelation {
  id: string;
  conceptSourceId: string;
  conceptTargetId: string;
  description?: string;
  weighting?: number;
}

interface IdeaEdge extends Edge {
  data?: {
    label?: string;
    weighting?: number;
  };
  label?: string;
  weighting?: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface LayoutOptions {
  direction: string;
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

  console.log("Processing concepts for edges:", concepts.length, "concepts");

  concepts.forEach((concept, conceptIndex) => {
    console.log(`Concept ${conceptIndex} (${concept.name}):`, {
      conceptSource: concept.conceptSource,
      conceptTarget: concept.conceptTarget,
    });

    // Process outgoing edges (where this concept is the source)
    if (concept.conceptSource && Array.isArray(concept.conceptSource)) {
      concept.conceptSource.forEach(
        (relation: ConceptRelation, relationIndex: number) => {
          const edgeId = String(relation.id);
          if (!processedEdges.has(edgeId)) {
            console.log(
              `  Processing conceptSource relation ${relationIndex}:`,
              relation,
            );
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
        },
      );
    }

    // Process incoming edges (where this concept is the target)
    // Note: We still need to process these in case some edges are only in conceptTarget
    if (concept.conceptTarget && Array.isArray(concept.conceptTarget)) {
      concept.conceptTarget.forEach(
        (relation: ConceptRelation, relationIndex: number) => {
          const edgeId = String(relation.id);
          if (!processedEdges.has(edgeId)) {
            console.log(
              `  Processing conceptTarget relation ${relationIndex}:`,
              relation,
            );
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
        },
      );
    }
  });

  console.log("Final edges array:", edges);
  return edges;
}

async function fetchNodesAndConceptsFromAPI(
  token: string | null,
): Promise<GraphData> {
  try {
    const response = await fetch(`${getApiUrl()}/api/v1/concepts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error(
        `Failed to fetch concepts: ${response.status} ${response.statusText}`,
      );
      console.error("Request URL:", `${getApiUrl()}/api/v1/concepts/`);
      throw new Error(
        `Failed to fetch concepts: ${response.status} ${response.statusText}`,
      );
    }
    const concepts = await response.json();
    console.log("Raw concepts from API:", concepts);

    const sortedNodes = concepts.sort(
      (a: { importance: number }, b: { importance: number }) =>
        b.importance - a.importance,
    );

    const nodes = sortedNodes.map(generateNode);
    console.log("Generated nodes:", nodes);

    const edges = extractEdgesFromConcepts(concepts);
    console.log("Generated edges:", edges);

    return { nodes, edges };
  } catch (error) {
    console.error("Error fetching concepts:", error);
    return { nodes: [], edges: [] };
  }
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions,
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(
    () => ({}) as Record<string, never>,
  );
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node: string | Dagre.Label) => {
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
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y }, data: node.data || {} };
    }),
    edges,
  };
};

function LayoutFlow() {
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<IdeaEdge | null>(null);
  const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
  const [importances, setImportances] = useState<
    Record<string, { code: number; category: string; description: string }>
  >({});
  const { accessToken } = useAuth();

  useEffect(() => {
    async function loadGraph() {
      if (!accessToken) return;
      const { nodes: rawNodes, edges: rawEdges } =
        await fetchNodesAndConceptsFromAPI(accessToken);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(rawNodes, rawEdges, { direction: "TB" });

      setNodes(layoutedNodes.map((n) => ({ ...n, id: String(n.id) })));
      setEdges(layoutedEdges);
      window.requestAnimationFrame(() => fitView());
    }

    loadGraph();
  }, [fitView, setNodes, setEdges, accessToken]);

  useEffect(() => {
    async function loadImportances() {
      try {
        const importancesResponse = await fetch(
          `${getApiUrl()}/api/v1/concepts/importances/`,
        );
        if (!importancesResponse.ok) {
          console.error(
            `Failed to fetch importances: ${importancesResponse.status} ${importancesResponse.statusText}`,
          );
          console.error(
            "Request URL:",
            `${getApiUrl()}/api/v1/concepts/importances/`,
          );
          return;
        }
        const importanceObject = await importancesResponse.json();
        setImportances(importanceObject);
      } catch (error) {
        console.error("Error loading importances:", error);
      }
    }

    loadImportances();
  }, []);

  const onNodesDelete = (nodesToDelete: Node[]) => {
    nodesToDelete.forEach(async (node) => {
      await fetch(`${getApiUrl()}/api/v1/concepts/${node.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });
    setNodes((nds) =>
      nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id)),
    );
  };

  const onEdgeDoubleClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge as IdeaEdge);
    setIsEdgeDialogOpen(true);
  };

  const onConnect: OnConnect = async (connection) => {
    await fetch(`${getApiUrl()}/api/v1/concepts/relation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        conceptSourceId: connection.source,
        conceptTargetId: connection.target,
        description: "",
        weighting: 0.5,
      }),
    });

    setEdges((edges) => addEdge(connection, edges));
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    changes.forEach(async (change: EdgeChange) => {
      if (change.type === "remove") {
        await fetch(`${getApiUrl()}/api/v1/concepts/relation/${change.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    });

    onEdgesChange(changes);
  };

  const handleSaveEdge = async (updatedEdge: IdeaEdge) => {
    if (!selectedEdge) return;

    const { data } = updatedEdge;
    if (
      !data ||
      typeof data !== "object" ||
      !("label" in data) ||
      !("weighting" in data)
    ) {
      console.error("Invalid edge data structure");
      return;
    }
    const { label: description, weighting } = data as {
      label: string;
      weighting: number;
    };

    const updatedEdges = edges.map((edge) =>
      edge.id === selectedEdge.id
        ? { ...edge, data: { label: description, weighting } }
        : edge,
    );

    setEdges(updatedEdges);
    setIsEdgeDialogOpen(false);

    try {
      await fetch(
        `${getApiUrl()}/api/v1/concepts/relation/${selectedEdge.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ description, weighting }),
        },
      );
    } catch (error) {
      console.error("Failed to update edge:", error);
    }
  };

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditDialogOpen(true);
  }, []);

  const handleAddNode = async (
    name: string,
    description: string,
    importance: number,
  ) => {
    const tempId = crypto.randomUUID();

    const newNode: Node = generateNode(
      {
        id: tempId,
        name,
        description,
        importance,
      },
      nodes.length,
    );

    setNodes((prev) => [...prev, newNode]);

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/concepts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, description, importance }),
      });

      if (response.ok) {
        const data = await response.json();
        const newId = data.id;

        setNodes((prev) =>
          prev.map((node) =>
            node.id === tempId ? { ...node, id: newId } : node,
          ),
        );
      } else {
        console.error("Failed to create node:", response.status);
      }
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

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

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <EditNodeDialog
        node={selectedNode ?? undefined}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={(updatedNode) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
          );
          setEditDialogOpen(false);
        }}
        importances={importances}
      />
      <div style={{ height: "100vh", width: "100vw" }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={handleEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onNodesDelete={onNodesDelete}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
          <Panel position="top-right">
            <Button onClick={() => setAddDialogOpen(true)}>+ New Node</Button>
            <Button onClick={() => onLayout("TB")}>Vertical Layout</Button>
            <Button onClick={() => onLayout("LR")}>Horizontal Layout</Button>
          </Panel>
        </ReactFlow>
      </div>

      <NewNodeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddNode={handleAddNode}
        importances={importances}
      />

      <EditEdgeDialog
        edge={selectedEdge}
        isOpen={isEdgeDialogOpen}
        onClose={() => setIsEdgeDialogOpen(false)}
        onSave={handleSaveEdge}
      />
    </div>
  );
}

function ConceptGraphEditor() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Concept Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}

export { ConceptGraphEditor };
export default ConceptGraphEditor;
