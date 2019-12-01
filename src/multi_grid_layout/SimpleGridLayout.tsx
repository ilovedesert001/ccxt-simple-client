import { observable, toJS } from "mobx";
import { observer, useForceUpdate, useLocalStore } from "mobx-react-lite";
import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import _ from "lodash";
import "./index.scss";
import { useStore } from "../state";

const gridHeaderHeight = 24;

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

              // state.getDomNodeByPosition()

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
              <Grid key={item.key} title={item.key}>
                {state.renderComponentByCompKey(item.compKey)}
              </Grid>
            );
          } else if (item.type === LayoutItemType.container) {
            return state.renderRnd(
              item,
              <Grid key={item.key} title={item.key}>
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

      getDomNodeByPosition(pos: PointPosition) {}
    }),
    props
  );

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
      <div className="SimpleGridLayoutContainer">
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

export const Grid = observer(function Window(props: { title?: any; children?: any; onCloseBtnClick?: any }) {
  const { title = "title", children = "nothing", onCloseBtnClick } = props;

  return (
    <div className="Grid">
      <div className="header">
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
      <div className="container">{children}</div>
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
