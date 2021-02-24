import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";

export interface Props {
  values: {
    key: string;
    value: any;
  }[];
}

const useStyles = makeStyles({
  table: {
    tableLayout: "fixed",
  },
  tableContainer: {
    height: "fit-content",
  },
});

export const AlgorithmValuesViewer: React.FC<Props> = (props) => {
  const { values } = props;
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      style={{
        width: "350px",
      }}
      className={`${classes.tableContainer}`}
    >
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow color="primary">
            <TableCell align="right">Symbol</TableCell>
            <TableCell align="left">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {values.map((KeyValue, index) => {
            const key = KeyValue.key;
            const value = KeyValue.value;
            if (typeof value === "number") {
              return (
                <TableRow key={key}>
                  <TableCell component="th" scope="row" align="right">
                    {key}
                  </TableCell>
                  <TableCell align="left">{value}</TableCell>
                </TableRow>
              );
            }
            // else if (typeof value === "object" && Array.isArray(value)) {
            //   let arrayString = ``;
            //   value.forEach((singleValue, index) => {
            //     return (arrayString += `${singleValue}, `);
            //   });
            //   return (
            //     <Typography>
            //       {key}={arrayString}
            //     </Typography>
            //   );
            // }
            else {
              return <></>;
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
