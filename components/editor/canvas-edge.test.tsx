/**
 * Run after installing test deps:
 *   npm install -D vitest @vitest/globals jsdom @testing-library/react @testing-library/user-event
 * Add to package.json scripts: "test": "vitest"
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { Position } from "@xyflow/react";

const mockUpdateEdgeData = vi.fn();

vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  return {
    ...actual,
    useReactFlow: () => ({ updateEdgeData: mockUpdateEdgeData }),
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    getSmoothStepPath: () => ["M0 0", 50, 50],
  };
});

const defaultProps = {
  id: "edge-1",
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  data: { label: "original" },
  selected: false,
  source: "node-1",
  target: "node-2",
  markerEnd: undefined,
  style: undefined,
  animated: false,
  interactionWidth: 20,
};

describe("CanvasEdgeRenderer — Escape key", () => {
  beforeEach(() => {
    mockUpdateEdgeData.mockClear();
  });

  it("does not call updateEdgeData when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<CanvasEdgeRenderer {...defaultProps} />);

    // Enter edit mode via double-click on the label div
    const label = screen.getByText("original");
    await user.dblClick(label);

    const input = screen.getByRole("textbox", { name: /edge label/i });
    await user.type(input, " edited");

    // Escape should cancel without committing
    await user.keyboard("{Escape}");

    expect(mockUpdateEdgeData).not.toHaveBeenCalled();
  });

  it("calls updateEdgeData when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<CanvasEdgeRenderer {...defaultProps} />);

    const label = screen.getByText("original");
    await user.dblClick(label);

    const input = screen.getByRole("textbox", { name: /edge label/i });
    await user.clear(input);
    await user.type(input, "new label{Enter}");

    expect(mockUpdateEdgeData).toHaveBeenCalledOnce();
    expect(mockUpdateEdgeData).toHaveBeenCalledWith("edge-1", {
      label: "new label",
    });
  });
});
