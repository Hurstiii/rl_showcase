import { createMuiTheme, MuiThemeProvider, Paper } from "@material-ui/core";
import { blue, green, purple, red } from "@material-ui/core/colors";
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import "./App.css";
import Simulation from "./components/Simulation";
import { AppTheme } from "./components/Theme";

const theme = AppTheme();

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Paper
          elevation={2}
          className="App-header"
          style={{
            width: "100%",
            minHeight: "50px",
            backgroundColor: "#6889f2",
          }}
          square={true}
        ></Paper>
        <main className="showcase">
          <Simulation />
        </main>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
