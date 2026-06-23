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
    n("microservices_gw", "API Gateway", "rectangle", C.blue, 185, 0, 160, 50),
    n("microservices_us", "User Service", "rectangle", C.blue, 0, 120, 130, 50),
    n("microservices_os", "Order Service", "rectangle", C.blue, 190, 120, 130, 50),
    n("microservices_ps", "Product Service", "rectangle", C.blue, 380, 120, 130, 50),
    n("microservices_udb", "User DB", "cylinder", C.teal, 10, 250, 110, 60),
    n("microservices_odb", "Order DB", "cylinder", C.teal, 200, 250, 110, 60),
    n("microservices_mq", "Message Queue", "hexagon", C.orange, 390, 250, 110, 60),
  ],
  edges: [
    e("microservices_e1", "microservices_gw", "microservices_us"),
    e("microservices_e2", "microservices_gw", "microservices_os"),
    e("microservices_e3", "microservices_gw", "microservices_ps"),
    e("microservices_e4", "microservices_us", "microservices_udb"),
    e("microservices_e5", "microservices_os", "microservices_odb"),
    e("microservices_e6", "microservices_os", "microservices_mq"),
    e("microservices_e7", "microservices_ps", "microservices_mq"),
  ],
};

const cicd: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description: "A linear build-test-deploy flow with a quality gate and staging environment.",
  nodes: [
    n("cicd_commit", "Code Commit", "rectangle", C.blue, 0, 55, 120, 50),
    n("cicd_build", "Build", "rectangle", C.purple, 150, 55, 100, 50),
    n("cicd_test", "Test", "rectangle", C.purple, 280, 55, 100, 50),
    n("cicd_gate", "Quality Gate", "diamond", C.orange, 405, 20, 90, 90),
    n("cicd_notify", "Notify Failure", "rectangle", C.red, 415, 165, 110, 50),
    n("cicd_staging", "Deploy Staging", "rectangle", C.green, 530, 55, 130, 50),
    n("cicd_prod", "Deploy Prod", "rectangle", C.green, 690, 55, 120, 50),
  ],
  edges: [
    e("cicd_e1", "cicd_commit", "cicd_build"),
    e("cicd_e2", "cicd_build", "cicd_test"),
    e("cicd_e3", "cicd_test", "cicd_gate"),
    e("cicd_e4", "cicd_gate", "cicd_staging", "pass"),
    e("cicd_e5", "cicd_gate", "cicd_notify", "fail"),
    e("cicd_e6", "cicd_staging", "cicd_prod"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "Producers emit events to a central bus consumed by independent downstream services.",
  nodes: [
    n("eventDriven_web", "Web App", "rectangle", C.blue, 0, 30, 120, 50),
    n("eventDriven_mobile", "Mobile App", "rectangle", C.blue, 0, 130, 120, 50),
    n("eventDriven_iot", "IoT Device", "rectangle", C.teal, 0, 230, 120, 50),
    n("eventDriven_bus", "Event Bus", "hexagon", C.orange, 190, 110, 120, 80),
    n("eventDriven_notif", "Notification", "rectangle", C.purple, 390, 0, 130, 50),
    n("eventDriven_analytics", "Analytics", "rectangle", C.purple, 390, 100, 130, 50),
    n("eventDriven_email", "Email Service", "rectangle", C.green, 390, 200, 130, 50),
    n("eventDriven_store", "Event Store", "cylinder", C.teal, 395, 300, 120, 60),
  ],
  edges: [
    e("eventDriven_e1", "eventDriven_web", "eventDriven_bus"),
    e("eventDriven_e2", "eventDriven_mobile", "eventDriven_bus"),
    e("eventDriven_e3", "eventDriven_iot", "eventDriven_bus"),
    e("eventDriven_e4", "eventDriven_bus", "eventDriven_notif"),
    e("eventDriven_e5", "eventDriven_bus", "eventDriven_analytics"),
    e("eventDriven_e6", "eventDriven_bus", "eventDriven_email"),
    e("eventDriven_e7", "eventDriven_bus", "eventDriven_store"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven];
