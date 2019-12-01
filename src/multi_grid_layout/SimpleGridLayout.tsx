import { observable, toJS } from "mobx";
import { observer, useForceUpdate, useLocalStore } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import _ from "lodash";
import "./index.scss";
import { useStore } from "../state";

const gridHeaderHeight = 24;

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

export const SimpleGridLayout = observer(function SimpleGridLayout(props: {
  layout: Layout;
  onLayoutChange?: any;
  keyToComponents?: {};
}) {
  const {
    layout = [],
    onLayoutChange,
    keyToComponents = {
      comp1: <div>custom component1</div>,
      comp2: <div>custom component2</div>
    }
  } = props;

  const store = useStore(); //TODO debug

  //define manager
  const rndManagerRef = useRef({
    maxZIndex: "999",
    prevDraggedNode: null as HTMLElement,
    prevDraggedNodeZIndex: null as string
  });

  const forceUpdate = useForceUpdate();

  window["show"] = () => {
    forceUpdate();
    console.log(JSON.stringify(layout, null, 2));
  };

  const state = useLocalStore(
    props => ({
      //for document.elementsFromPoint(100,100)
      rootOffset: {
        x: 0,
        y: 0
      },

      triggerLayoutChange() {
        onLayoutChange && onLayoutChange(props.layout);
      },

      renderComponentByCompKey(key: string) {
        let comp = keyToComponents[key]; //TODO wrong way
        if (!comp) {
          comp = (
            <div>
              <h2>Undefined component</h2>
            </div>
          );
        }
        return comp;
      },

      renderRnd(item: LayoutItem, child: any) {
        return (
          <Rnd
            key={item.key}
            className={"RndItem"}
            // bounds="parent"
            default={{
              x: item.node.x,
              y: item.node.y,
              width: item.node.w,
              height: item.node.h
            }}
            resizeGrid={[24, 24]}
            // dragGrid={[24, 24]}
            dragHandleClassName={"header"}
            onDragStart={(e, node) => {
              // console.log("AAA", node);
              e.stopPropagation();
              const manager = rndManagerRef.current;
              if (manager.prevDraggedNode) {
                manager.prevDraggedNode.style.zIndex = manager.prevDraggedNodeZIndex;
              }
              manager.prevDraggedNode = node.node;
              manager.prevDraggedNodeZIndex = manager.prevDraggedNode.style.zIndex;
              manager.prevDraggedNode.style.zIndex = manager.maxZIndex;
            }}
            onDragStop={(e, position) => {
              item.node.x = position.x;
              item.node.y = position.y;
              //重新计算每个窗口的世界坐标
              state.recalculateWordPos(null, layout);

              state.getDomNodesByItemPosition(item);

              store.uiStates.info = item;
              state.triggerLayoutChange();
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              item.node.x = position.x;
              item.node.y = position.y;

              item.node.w = ref.style.width;
              item.node.h = ref.style.height;
              state.triggerLayoutChange();
            }}
          >
            {child}
          </Rnd>
        );
      },

      renderLayout(layout: Layout) {
        return layout.map(item => {
          if (item.type === LayoutItemType.window) {
            return state.renderRnd(
              item,
              <Grid
                key={item.key}
                layoutItem={item}
                title={item.key}
                onCloseBtnClick={() => {
                  state.removeItem(item);
                }}
              >
                {state.renderComponentByCompKey(item.compKey)}
              </Grid>
            );
          } else if (item.type === LayoutItemType.container) {
            return state.renderRnd(
              item,
              <Grid
                key={item.key}
                layoutItem={item}
                title={item.key}
                onCloseBtnClick={() => {
                  state.removeItem(item);
                }}
              >
                {state.renderLayout(item.children)}
              </Grid>
            );
          }
          // else if (item.type === LayoutItemType.tabs) {
          //   return (
          //     <Grid key={item.key} title={item.key}>
          //       {state.renderLayout(item.children)}
          //     </Grid>
          //   );
          // }
        });
      },

      recalculateWordPos(container: LayoutItem, layout: Layout) {
        return layout.forEach(item => {
          if (item.children && item.children.length > 0) {
            state.itemLocalPosToWordPos(container, item);
            state.recalculateWordPos(item, item.children);
          } else {
            state.itemLocalPosToWordPos(container, item);
          }
        });
      },

      //本地坐标，转换成世界(世界，也就是 root 元素->SimpleGridLayoutContainer)坐标
      itemLocalPosToWordPos(container: LayoutItem, item: LayoutItem) {
        const pos = {
          x: 0,
          y: 0
        };
        if (container) {
          pos.x = container.node.wordPos.x;
          pos.y = container.node.wordPos.y;

          if (item) {
            pos.y += gridHeaderHeight;
          }

          // pos.x = container.node.wordPos.x;
          // pos.y = container.node.wordPos.y;
        }

        if (item.key == "container1_container") {
          console.log("AAAA", item, container);
        }

        item.node.wordPos = {
          x: item.node.x + pos.x,
          y: item.node.y + pos.y
        };
      },

      getDomNodesByItemPosition(item: LayoutItem) {
        let target = null as HTMLDivElement; // drop target element

        const pos = {
          x: item.node.wordPos.x + state.rootOffset.x - 2,
          y: item.node.wordPos.y + state.rootOffset.y - 2
        };

        // console.log(pos);
        const els = document.elementsFromPoint(pos.x, pos.y);
        console.log("el", els);
        const el = els[1];
        if (el) {
          console.log("xxx", el.getAttribute("data-dropable"));
          if (el.getAttribute("data-dropable") === "true") {
            target = el as HTMLDivElement;
          } else {
            target = parent_by_selector(el, "[data-dropable='true']");
          }
          console.log("target", target);

          if (target) {
            state.handleItemDropByTargetDomNode(item, target);
          }
        }

        return target;
      },

      handleItemDropByTargetDomNode(item: LayoutItem, el: HTMLDivElement) {
        // 1. remove item from it's parent
        state.eachItem(layout, (o, parent) => {
          if (o.key === item.key) {
            _.pull(parent, item);
            return false;
          } else {
            return true;
          }
        });

        item.node.x = item.node.wordPos.x;
        item.node.y = item.node.wordPos.y;

        // 2. find dom element's item(LayoutItem) -> target
        // 3. put item to target, (if target is not container , then change to container)
        const targetKey = el.getAttribute("data-layoutitemkey");
        if (targetKey) {
          const target = state.findLayoutItemByKey(targetKey, props.layout);
          console.log("target", targetKey, target, props.layout);

          if (target) {
            //TODO wrong way
            if (target.type === LayoutItemType.window) {
              const originWindow = _.cloneDeep(target); //TODO wrong way
              target.type = LayoutItemType.container;
              target.children = [originWindow];
            }
            target.children.push(item);
          }
        } else {
          props.layout.push(item);
        }

        forceUpdate();
      },

      eachItem(layout: Layout, handler: (item: LayoutItem, parent: Layout) => boolean) {
        for (const item of layout) {
          const needContinue = handler(item, layout);
          if (needContinue) {
            if (item.type === LayoutItemType.container) {
              state.eachItem(item.children, handler);
            }
          } else {
            break;
          }
        }
      },

      findLayoutItemByKey(key: string, layout: Layout): LayoutItem {
        let target = null as LayoutItem;
        state.eachItem(layout, item => {
          if (item.key === key) {
            target = item;
            return false;
          } else {
            return true;
          }
        });
        return target;
      },

      removeItem(item) {
        state.eachItem(layout, (o, parent) => {
          if (o.key === item.key) {
            _.pull(parent, item);
            return false;
          } else {
            return true;
          }
        });
        forceUpdate();
      }
    }),
    props
  );

  const containerRoot = useRef(null as HTMLDivElement);

  useEffect(() => {
    const react = containerRoot.current.getBoundingClientRect();
    state.rootOffset.x = react.x;
    state.rootOffset.y = react.y;
  }, []);

  // const layout = toJS(state.layout);

  console.log("render SimpleGridLayout");

  return (
    <div className={"SimpleGridLayout"}>
      SimpleGridLayout
      {/*<button*/}
      {/*  onClick={() => {*/}
      {/*    const item = layout[2].children[0];*/}
      {/*    _.pull(layout[2].children, item);*/}
      {/*    layout.push(item);*/}
      {/*    forceUpdate();*/}
      {/*  }}*/}
      {/*>*/}
      {/*  move container1_window1 outside*/}
      {/*</button>*/}
      {/*<button*/}
      {/*  onClick={() => {*/}
      {/*    const item = layout[0];*/}
      {/*    _.pull(layout, item);*/}
      {/*    layout[1].children.push(item);*/}
      {/*    forceUpdate();*/}
      {/*  }}*/}
      {/*>*/}
      {/*  move window1 into container*/}
      {/*</button>*/}
      {/*SimpleGridLayoutContainer 作为坐标系 ，左上角为原点，建立直角坐标系 */}
      <div className="SimpleGridLayoutContainer" ref={containerRoot} data-dropable={true}>
        {state.renderLayout(layout)}
        <div className={"debug"}>
          <Point />
        </div>
      </div>
    </div>
  );
});

const Point = observer(function Point() {
  const store = useStore();
  const info = store.uiStates.info as LayoutItem;

  const pointSize = 20;

  if (info && info.node.wordPos) {
    return (
      <div
        style={{
          background: "white",
          position: "absolute",
          width: pointSize,
          height: pointSize,
          borderRadius: "50%",
          left: info.node.wordPos.x - pointSize / 2,
          top: info.node.wordPos.y - pointSize / 2,
          zIndex: 9999
        }}
      />
    );
  } else {
    return null;
  }
});

export const Grid = observer(function Window(props: {
  layoutItem: LayoutItem;
  title?: any;
  children?: any;
  onCloseBtnClick?: any;
}) {
  const { layoutItem, title = "title", children = "nothing", onCloseBtnClick } = props;

  return (
    <div className="Grid" data-layoutitemkey={layoutItem.key}>
      <div className="header" data-dropable={true} data-layoutitemkey={layoutItem.key}>
        <div className="left">{title}</div>
        <div
          className="right"
          onClick={() => {
            onCloseBtnClick && onCloseBtnClick();
          }}
        >
          X
        </div>
      </div>
      <div className="container" data-dropable={true} data-layoutitemkey={layoutItem.key}>
        {children}
      </div>
    </div>
  );
});

export enum LayoutItemType {
  window = "window", //single window
  container = "container",
  tabs = "tabs" //tab container
}

export interface LayoutItem {
  type: LayoutItemType;
  key: string;
  compKey: string;
  children: LayoutItem[];

  //node info , position  , size, relative to parent

  node: {
    x: number;
    y: number;
    w: string; //px
    h: string;

    wordPos: PointPosition;
  };
}

export type Layout = LayoutItem[];

export interface PointPosition {
  x: number;
  y: number;
}
