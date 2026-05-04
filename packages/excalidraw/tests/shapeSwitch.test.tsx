import React from "react";
import { expect } from "vitest";

import { KEYS, reseed } from "@excalidraw/common";

import { getLinearElementSubType } from "@excalidraw/element";

import { pointFrom } from "@excalidraw/math";

import type {
  ExcalidrawArrowElement,
  ExcalidrawLinearElement,
} from "@excalidraw/element/types";
import type { LocalPoint } from "@excalidraw/math";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { Keyboard } from "./helpers/ui";
import { render, screen, unmountComponent } from "./test-utils";

unmountComponent();

beforeEach(() => {
  localStorage.clear();
  reseed(7);
});

describe("shape switcher", () => {
  it("switches between arrow types with Tab when the arrow is bound", async () => {
    await render(<Excalidraw />);

    const rectangle = API.createElement({
      type: "rectangle",
      id: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      boundElements: [{ type: "arrow", id: "arrow" }],
    });
    const endBinding: ExcalidrawArrowElement["endBinding"] = {
      elementId: rectangle.id,
      fixedPoint: [0, 0.5],
      mode: "orbit",
    };
    const arrow = API.createElement({
      type: "arrow",
      id: "arrow",
      x: 0,
      y: 150,
      width: 100,
      height: 0,
      points: [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(100, 0)],
      roundness: null,
      endBinding,
      endArrowhead: "arrow",
    });

    API.setElements([rectangle, arrow]);
    API.setSelectedElements([arrow]);

    const editor = document.querySelector(
      ".excalidraw-container",
    ) as HTMLElement;
    editor.focus();

    Keyboard.keyPress(KEYS.TAB, editor);

    expect(await screen.findByTestId("toolbar-sharpArrow")).toBeTruthy();
    const popup = document.querySelector(".ConvertElementTypePopup")!;
    expect(popup.querySelector('[data-testid="toolbar-line"]')).toBeNull();

    Keyboard.keyPress(KEYS.TAB, editor);

    let switchedArrow = API.getElement(arrow) as ExcalidrawLinearElement;
    expect(getLinearElementSubType(switchedArrow)).toBe("curvedArrow");
    expect(switchedArrow.endBinding).toEqual(endBinding);

    Keyboard.keyPress(KEYS.TAB, editor);
    switchedArrow = API.getElement(arrow) as ExcalidrawLinearElement;
    expect(getLinearElementSubType(switchedArrow)).toBe("elbowArrow");
    expect(switchedArrow.endBinding).toEqual(endBinding);

    Keyboard.keyPress(KEYS.TAB, editor);
    switchedArrow = API.getElement(arrow) as ExcalidrawLinearElement;
    expect(getLinearElementSubType(switchedArrow)).toBe("sharpArrow");
    expect(switchedArrow.endBinding).toEqual(endBinding);
  });
});
