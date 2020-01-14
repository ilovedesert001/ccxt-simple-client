import { observer, useLocalStore } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { PageStruct } from "../Util";
import "./index.scss";
import { useStore } from "../../state";
import { IWindowItem, WindowItemChildrenType, WindowItemType } from "../../windowLayout/WindowBase";
import { LayoutWindowManager } from "../../windowLayout/LayoutWindowManager";
import { testLayout } from "../../windowLayout";

export const WindowLayoutDrawTest = observer(function WindowLayoutDrawTest() {
  const store = useStore();

  const canvasEl = useRef(null as HTMLCanvasElement);

  useEffect(() => {
    const ctx = canvasEl.current.getContext("2d");

    const manager = new LayoutWindowManager();

    manager.rebuildRootState(testLayout);

    const layouts = [manager.root];

    function drawWindow(layouts: WindowItemChildrenType) {
      for (const layout of layouts) {
        const { w, h } = layout.options.transform;
        const { x, y } = layout.state.worldPosition;

        ctx.font = "14px serif";
        ctx.fillText(layout.key, x + 4, y + 14);

        if (layout.type === "window") {
          ctx.strokeStyle = "blue";
          ctx.strokeRect(x, y, w, h);
        } else if (layout.type === "container") {
          ctx.strokeStyle = "red";
          ctx.strokeRect(x, y, w, h);
          drawWindow(layout.children);
        }
      }
    }

    drawWindow(layouts);
  });

  return (
    <div className={"WindowLayoutDrawTest"}>
      <canvas ref={canvasEl} className={"canvas"} width="1280" height="900" />
    </div>
  );
});
