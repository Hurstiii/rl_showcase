import { Card, Grid, makeStyles } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

export interface Props {
  selected: number; // the square selected
  Q: Map<string, number>;
  pi: Map<string, number>;
}

export interface ArrowProps {
  up: string;
  right: string;
  down: string;
  left: string;
  symbol: string;
}

const ArrowGrid = styled.div`
  display: grid;
  grid-template: 25px 50px 50px 50px 25px / 25px 50px 50px 50px 25px;
  width: max-content;
  justify-items: center;
  align-items: center;
`;

const useStyles = makeStyles({
  valueStyle: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "rgba(210, 210, 210, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const ArrowSquareView: React.FC<ArrowProps> = (props) => {
  const { up, right, down, left, symbol } = props;
  const classes = useStyles();

  return (
    <ArrowGrid>
      <div style={{ gridRow: "1 / 2", gridColumn: "3 / 4" }}>{"^"}</div>
      <div
        style={{ gridRow: "2 / 3", gridColumn: "3 / 4" }}
        className={classes.valueStyle}
      >
        <div>{up}</div>
      </div>
      <div style={{ gridRow: "3 / 4", gridColumn: "1 / 2" }}>{"<"}</div>
      <div
        style={{ gridRow: "3 / 4", gridColumn: "2 / 3" }}
        className={classes.valueStyle}
      >
        {left}
      </div>
      <div style={{ gridRow: "3 / 4", gridColumn: "3 / 4" }}>{symbol}</div>
      <div
        style={{ gridRow: "3 / 4", gridColumn: "4 / 5" }}
        className={classes.valueStyle}
      >
        {right}
      </div>
      <div style={{ gridRow: "3 / 4", gridColumn: "5 / 6" }}>{">"}</div>
      <div
        style={{ gridRow: "4 / 5", gridColumn: "3 / 4" }}
        className={classes.valueStyle}
      >
        {down}
      </div>
      <div style={{ gridRow: "5 / 6", gridColumn: "3 / 4" }}>{"V"}</div>
    </ArrowGrid>
  );
};

export const SquareView: React.FC<Props> = (props) => {
  const { selected, Q, pi } = props;

  /**
   * pi =
   *         ^
   *         5%
   *         |
   * < 85% -   - 5% >
   *         |
   *         5%
   *         V
   *
   * Q =
   *        ....
   */

  const QValues = {
    up: Q.has(`${selected},0`) ? Q.get(`${selected},0`)?.toFixed(2) : undefined,
    right: Q.has(`${selected},1`)
      ? Q.get(`${selected},1`)?.toFixed(2)
      : undefined,
    down: Q.has(`${selected},2`)
      ? Q.get(`${selected},2`)?.toFixed(2)
      : undefined,
    left: Q.has(`${selected},3`)
      ? Q.get(`${selected},3`)?.toFixed(2)
      : undefined,
  };

  const piValues = {
    up: pi.has(`${selected},0`)
      ? pi.get(`${selected},0`)?.toFixed(2)
      : undefined,
    right: pi.has(`${selected},1`)
      ? pi.get(`${selected},1`)?.toFixed(2)
      : undefined,
    down: pi.has(`${selected},2`)
      ? pi.get(`${selected},2`)?.toFixed(2)
      : undefined,
    left: pi.has(`${selected},3`)
      ? pi.get(`${selected},3`)?.toFixed(2)
      : undefined,
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item>
          {QValues.up && QValues.right && QValues.down && QValues.left && (
            <ArrowSquareView
              up={QValues.up}
              right={QValues.right}
              down={QValues.down}
              left={QValues.left}
              symbol="Q"
            />
          )}
        </Grid>
        <Grid item>
          {piValues.up && piValues.right && piValues.down && piValues.left && (
            <ArrowSquareView
              up={piValues.up}
              right={piValues.right}
              down={piValues.down}
              left={piValues.left}
              symbol="pi"
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};
