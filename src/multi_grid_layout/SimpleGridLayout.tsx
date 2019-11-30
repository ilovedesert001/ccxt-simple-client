import { observable, toJS } from "mobx";
import { observer, useForceUpdate, useLocalStore } from "mobx-react-lite";
import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import _ from "lodash";
import "./index.scss";

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
            dragGrid={[24, 24]}
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
      }
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
      <div className="SimpleGridLayoutContainer">{state.renderLayout(layout)}</div>
    </div>
  );
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
  };
}

export type Layout = LayoutItem[];

const layout = [
  {
    type: "window",
    key: "markets",
    compKey: "MarketsView",
    node: { x: 0, y: 0, w: "408px", h: "552px" }
  },
  {
    type: "window",
    key: "orderBook",
    compKey: "OrderBook",
    node: { x: 408, y: 0, w: "408px", h: "552px" }
  },
  {
    type: "window",
    key: "trades",
    compKey: "RecentTrades",
    node: { x: 816, y: 0, w: "384px", h: "552px" }
  },
  {
    type: "container",
    key: "container1",
    node: { x: 1, y: 551, w: "1512px", h: "1200px" },
    children: [
      {
        type: "window",
        key: "accounts",
        compKey: "AccountsView",
        node: { x: 415, y: 2, w: "408px", h: "696px" }
      },
      {
        type: "window",
        key: "balance",
        compKey: "CurrentBalance",
        node: { x: 0, y: 0, w: "408px", h: "480px" }
      },
      {
        type: "window",
        key: "orders",
        compKey: "AccountOrders",
        node: {
          x: 5,
          y: 668.3361206054688,
          w: "1464px",
          h: "192px"
        }
      }
    ]
  }
] as Layout;
