import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import type { NodeShape } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const C = {
  blue: NODE_COLORS[1].fill,
  purple: NODE_COLORS[2].fill,
  orange: NODE_COLORS[3].fill,
  red: NODE_COLORS[4].fill,
  pink: NODE_COLORS[5].fill,
  green: NODE_COLORS[6].fill,
  teal: NODE_COLORS[7].fill,
  dark: NODE_COLORS[0].fill,
} as const;

function n(
  id: string,
  label: string,
  shape: NodeShape,
  color: string,
  x: number,
  y: number,
  width = 130,
  height = 50
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color, shape },
    width,
    height,
  };
}

function e(id: string, source: string, target: string, label = ""): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label },
    sourceHandle: null,
    targetHandle: null,
  };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "API gateway fanning out to independent services backed by dedicated databases.",
  nodes: [
    n("gw", "API Gateway", "rectangle", C.blue, 185, 0, 160, 50),
    n("us", "User Service", "rectangle", C.blue, 0, 120, 130, 50),
    n("os", "Order Service", "rectangle", C.blue, 190, 120, 130, 50),
    n("ps", "Product Service", "rectangle", C.blue, 380, 120, 130, 50),
    n("udb", "User DB", "cylinder", C.teal, 10, 250, 110, 60),
    n("odb", "Order DB", "cylinder", C.teal, 200, 250, 110, 60),
    n("mq", "Message Queue", "hexagon", C.orange, 390, 250, 110, 60),
  ],
  edges: [
    e("e1", "gw", "us"),
    e("e2", "gw", "os"),
    e("e3", "gw", "ps"),
    e("e4", "us", "udb"),
    e("e5", "os", "odb"),
    e("e6", "os", "mq"),
    e("e7", "ps", "mq"),
  ],
};

const cicd: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A linear build-test-deploy flow with a quality gate and staging environment.",
  nodes: [
    n("commit", "Code Commit", "rectangle", C.blue, 0, 55, 120, 50),
    n("build", "Build", "rectangle", C.purple, 150, 55, 100, 50),
    n("test", "Test", "rectangle", C.purple, 280, 55, 100, 50),
    n("gate", "Quality Gate", "diamond", C.orange, 405, 20, 90, 90),
    n("notify", "Notify Failure", "rectangle", C.red, 415, 165, 110, 50),
    n("staging", "Deploy Staging", "rectangle", C.green, 530, 55, 130, 50),
    n("prod", "Deploy Prod", "rectangle", C.green, 690, 55, 120, 50),
  ],
  edges: [
    e("e1", "commit", "build"),
    e("e2", "build", "test"),
    e("e3", "test", "gate"),
    e("e4", "gate", "staging", "pass"),
    e("e5", "gate", "notify", "fail"),
    e("e6", "staging", "prod"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "Producers emit events to a central bus consumed by independent downstream services.",
  nodes: [
    n("web", "Web App", "rectangle", C.blue, 0, 30, 120, 50),
    n("mobile", "Mobile App", "rectangle", C.blue, 0, 130, 120, 50),
    n("iot", "IoT Device", "rectangle", C.teal, 0, 230, 120, 50),
    n("bus", "Event Bus", "hexagon", C.orange, 190, 110, 120, 80),
    n("notif", "Notification", "rectangle", C.purple, 390, 0, 130, 50),
    n("analytics", "Analytics", "rectangle", C.purple, 390, 100, 130, 50),
    n("email", "Email Service", "rectangle", C.green, 390, 200, 130, 50),
    n("store", "Event Store", "cylinder", C.teal, 395, 300, 120, 60),
  ],
  edges: [
    e("e1", "web", "bus"),
    e("e2", "mobile", "bus"),
    e("e3", "iot", "bus"),
    e("e4", "bus", "notif"),
    e("e5", "bus", "analytics"),
    e("e6", "bus", "email"),
    e("e7", "bus", "store"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven];
