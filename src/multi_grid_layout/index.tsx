import { observable, toJS } from "mobx";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { ReactChild, ReactElement, useEffect } from "react";
import "./index.scss";
import RGL, { WidthProvider } from "react-grid-layout";
import _ from "lodash";
import { Grid, SimpleGridLayout } from './SimpleGridLayout'

const ReactGridLayout = WidthProvider(RGL);

export const MultiGridLayout = observer(function() {

  return (
    <div className={"MultiGridLayout"}>
      test

      <SimpleGridLayout/>

      <hr/>
      {/*<BasicLayout />*/}
      {/*<BasicLayout />*/}
      {/*<div style={{ width: 600, height: 300 }}>*/}
      {/*  <Grid title={"container"}>*/}
      {/*    <Grid title={"window1"} />*/}
      {/*    <Grid title={"window2"} />*/}
      {/*  </Grid>*/}
      {/*</div>*/}
    </div>
  );
});


const BasicLayout = observer(function() {
  const state = useLocalStore(() => ({
    className: "layout",
    items: 4,
    rowHeight: 30,
    onLayoutChange: function(...args) {
      console.log("onLayoutChange", ...args);
    },
    cols: 12,

    layout: [
      {
        i: "1",
        x: 0,
        y: 0,
        w: 12,
        h: 10
      },
      {
        i: "2",
        x: 0,
        y: 0,
        w: 12,
        h: 10
      }
    ],
    generateDOM() {
      return _.map(state.layout, function(o) {
        return (
          <div key={o.i}>
            {o.i === "2" ? (
              <BasicLayout2 />
            ) : (
              <span className="text">{o.i}</span>
            )}
          </div>
        );
      });
    }
  }));

  useEffect(() => {}, []);

  const layout = toJS(state.layout);

  return (
    <ReactGridLayout
      layout={layout}
      onLayoutChange={state.onLayoutChange}
      items={state.items}
      rowHeight={30}
      cols={12}
      verticalCompact={false}
    >
      {state.generateDOM()}
    </ReactGridLayout>
  );
});

const BasicLayout2 = observer(function() {
  const state = useLocalStore(() => ({
    className: "layout",
    items: 3,
    rowHeight: 30,
    onLayoutChange: function(...args) {
      console.log("onLayoutChange", ...args);
    },
    cols: 12,
    generateLayout() {
      const p = state;
      return _.map(new Array(p.items), function(item, i) {
        const y: number = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
        return {
          x: (i * 2) % 12,
          y: Math.floor(i / 6) * y,
          w: 2,
          h: y,
          i: i.toString()
        };
      });
    },

    layout: [],
    generateDOM() {
      const p = state;
      return _.map(_.range(p.items), function(i) {
        return (
          <div key={i}>
            <span className="text">{i}</span>
          </div>
        );
      });
    }
  }));

  useEffect(() => {
    state.layout = state.generateLayout();
  }, []);

  const layout = toJS(state.layout);

  return (
    <ReactGridLayout
      layout={layout}
      onLayoutChange={state.onLayoutChange}
      items={state.items}
      rowHeight={30}
      cols={12}
      verticalCompact={false}
    >
      {state.generateDOM()}
    </ReactGridLayout>
  );
});
