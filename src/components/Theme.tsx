import {
  Color,
  createMuiTheme,
  SimplePaletteColorOptions,
  Theme,
} from "@material-ui/core";
import { blue, purple, red } from "@material-ui/core/colors";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { Palette } from "@material-ui/icons";
import { NONAME } from "dns";

// table: {
//   tableLayout: "fixed",
// },
// tableContainer: {
//   borderRadius: 0,
// },
// headCell: {
//   fontWeight: 700,
//   color: "#ffffff",
// },
// headRow: {
//   // background: "#6889F2",
//   zIndex: 2,
//   boxShadow: "2px 0 6px -3px #000",
// },
// bodyRow: {
//   zIndex: 1,
//   boxShadow: "1px 0 2px -1px #000",
// },

export const ColorValues = {
  primary: {
    main: "#6889F2",
    light: "#6E90FF",
    dark: "#1B2440",
  },
  secondary: {
    main: "#AB62E3",
    light: "#BF6DFC",
    dark: "#5E367D",
  },
};

export const Colors: PaletteOptions = {
  primary: {
    main: "#6889F2",
    light: "#6E90FF",
    dark: "#1B2440",
  },
  secondary: {
    main: "#AB62E3",
    light: "#BF6DFC",
    dark: "#5E367D",
  },
};

const ColorsTheme = createMuiTheme({
  palette: {
    primary: Colors.primary,
    secondary: Colors.secondary,
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

const createAppTheme = (theme: Theme) =>
  createMuiTheme({
    palette: { ...theme.palette },
    overrides: {
      MuiTableHead: {
        root: {
          background: theme.palette.primary.main,
          boxShadow: "2px 0 6px -3px #000",
          zIndex: 2,
        },
      },
      MuiTableCell: {
        head: { color: theme.palette.primary.contrastText, fontWeight: 700 },
        body: { background: "#fff" },
        root: { borderBottom: "solid 1px rgba(0,0,0,0.2)", fontSize: "1rem" },
      },
      MuiTableRow: {
        root: {
          zIndex: 1,
          boxShadow: "1px 0 2px -1px #000",
        },
      },
    },
  });

export const AppTheme = () => createAppTheme(ColorsTheme);
