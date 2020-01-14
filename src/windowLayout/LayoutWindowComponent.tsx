import React, { memo, useContext, useEffect, useState } from "react";
import { LayoutWindowManager } from "./LayoutWindowManager";
import { IWindowItem, WindowItemType } from "./WindowBase";
import classNames from "classnames";
import { useForceUpdate } from "mobx-react-lite";
import { Rnd } from "react-rnd";
import _ from "lodash";

type typeLayoutWindowComponentProps = {
  layout: IWindowItem;
};

const LayoutWindowContext = React.createContext(null as {
  manager: LayoutWindowManager;
  forceUpdate: () => void;
});

const useLayoutWindow = () => useContext(LayoutWindowContext);

export function LayoutWindowComponent(props: typeLayoutWindowComponentProps) {
  console.log("render LayoutWindowComponent");

  const { layout } = props;

  const forceUpdate = useForceUpdate();

  const [context] = useState(() => {
    const manager = new LayoutWindowManager();
    manager.rebuildRootState(layout);
    return {
      manager,
      forceUpdate
    };
  });

  const { manager } = context;

  useEffect(() => {
    const win = window as any;

    win.xx = {
      manager,
      forceUpdate,
      remove1() {
        manager.removeItem(manager.itemByKey["c2_w2"]);
        forceUpdate();
      },

      drop1() {
        const from = manager.itemByKey["c2_w2"];
        const to = manager.itemByKey["root_container1"];

        manager.handleDrop(from, to);

        forceUpdate();
      },

      drop2() {
        const from = manager.itemByKey["container2"];
        const to = manager.itemByKey["root"];

        manager.handleDrop(from, to);

        forceUpdate();
      }
    };
  }, []);

  const renderWindows = (layout: IWindowItem) => {
    if (layout.type === WindowItemType.window) {
      return (
        <LayoutWindowItemComponent key={layout.key} layout={layout} children={<div>这是{layout.key} 的内容</div>} />
      );
    } else if (layout.type === WindowItemType.container) {
      return (
        <LayoutWindowItemComponent
          key={layout.key}
          layout={layout}
          children={layout.children.map(item => renderWindows(item))}
        />
      );
    }
  };

  return (
    <LayoutWindowContext.Provider value={context}>
      <div className={"LayoutWindowComponent"}>{renderWindows(manager.root)}</div>;
    </LayoutWindowContext.Provider>
  );
}

const LayoutWindowItemComponent = memo(function LayoutWindowItemComponent(props: {
  layout: IWindowItem;
  children: React.ReactNode;
}) {
  const { layout, children } = props;

  const { x, y, w, h } = layout.options.transform;

  const c = useLayoutWindow();

  //如果不是 root
  // y 偏移

  const lock = layout.options.lock;

  return (
    <Rnd
      key={layout.key}
      className={classNames(
        "RndItem",
        {
          lock: lock
        },
        `windowType-${layout.type}`
      )}
      // bounds="parent"
      default={{
        x: x,
        y: y,
        width: w,
        height: h
      }}
      disableDragging={lock}
      // enableResizing={item.lock}
      resizeGrid={[24, 24]}
      // dragGrid={[24, 24]}
      dragHandleClassName={"WindowHeaderLeft"}
      onDragStart={(e, node) => {
        e.stopPropagation();

        //move current item to root el

        // const manager = rndManagerRef.current;
        // if (manager.prevDraggedNode) {
        //   manager.prevDraggedNode.style.zIndex = manager.prevDraggedNodeZIndex;
        // }
        // manager.prevDraggedNode = node.node;
        // manager.prevDraggedNodeZIndex = manager.prevDraggedNode.style.zIndex;
        // manager.prevDraggedNode.style.zIndex = manager.maxZIndex;
      }}
      onDrag={(e, node) => {
        // console.log(node);
      }}
      onDragStop={(e, node) => {
        // item.node.x = position.x;
        // item.node.y = position.y;
        // //重新计算每个窗口的世界坐标
        // state.recalculateWordPos(null, layout);
        //
        // state.getDomNodesByItemPosition(item);
        //
        // store.uiStates.info = item;
        // state.triggerLayoutChange();

        //to x, y
        const fromEl = node.node;

        const fromElClientReact = fromEl.getBoundingClientRect();

        const targetPos = {
          x: fromElClientReact.left,
          y: fromElClientReact.top
        };

        const pos = {
          x: targetPos.x - 2,
          y: targetPos.y - 2
        };

        const els = document.elementsFromPoint(pos.x, pos.y);
        let targetEl = els[1];
        if (targetEl) {
          // targetEl = parent_by_selector(targetEl, "[data-dropable='true']");
          targetEl = parent_by_selector(targetEl, "[data-layout-is='true']");
          if (targetEl) {
            const targetContainerEl = targetEl.querySelector(".WindowContainer");
            const targetContainerElClientReact = targetContainerEl.getBoundingClientRect();
            const to = c.manager.itemByKey[targetEl.getAttribute("data-layout-key")];

            const targetLocalPos = {
              x: fromElClientReact.left - targetContainerElClientReact.left,
              y: fromElClientReact.top - targetContainerElClientReact.top
            };

            console.log("AAA", targetLocalPos);

            layout.options.transform.x = targetLocalPos.x;
            layout.options.transform.y = targetLocalPos.y;
            c.manager.handleDrop(layout, to);
            console.log(targetEl, layout);

            c.manager.rebuildRootState(c.manager.root);
            _.delay(() => {
              c.forceUpdate();
            }, 1);

            // state.handleItemDropByTargetDomNode(item, target, targetPoint);
          }
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        layout.options.transform.x = position.x;
        layout.options.transform.y = position.y;

        layout.options.transform.w = Number.parseFloat(ref.style.width);
        layout.options.transform.h = Number.parseFloat(ref.style.height);

        console.log(layout);

        c.manager.rebuildRootState(c.manager.root);
        _.delay(() => {
          c.forceUpdate();
        }, 1);

        // console.log("AAAA",delta);
      }}
    >
      <div className="Window" data-layout-key={layout.key} data-layout-is={true}>
        <div className="WindowHeader" data-dropable={true}>
          <div className="WindowHeaderLeft">{layout.key}</div>
          <div className="WindowHeaderRight">
            <div
              className={classNames("icon", {
                off: layout.options.lock !== true
              })}
              onClick={() => {
                console.log("lock !");
              }}
            >
              L
            </div>

            <div
              className={"icon"}
              onClick={() => {
                // onCloseBtnClick && onCloseBtnClick();
              }}
            >
              X
            </div>
          </div>
        </div>
        <div className="WindowContainer" data-dropable={true}>
          {children}
        </div>
      </div>
    </Rnd>
  );
});

function parent_by_selector(node, selector, stop_selector = "body") {
  var parent = node.parentNode;
  while (true) {
    if (parent.matches(stop_selector)) break;
    if (parent.matches(selector)) break;
    parent = parent.parentNode; // get upper parent and check again
  }
  if (parent.matches(stop_selector)) parent = null; // when parent is a tag 'body' -> parent not found
  return parent;
}
