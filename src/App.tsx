import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
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
        <header className="App-header"></header>
        <Simulation />
      </div>
    </MuiThemeProvider>
  );
}

export default App;
