import React, { useState } from "react";
import "./App.css";
import FrozenLake from "./components/FrozenLake";
import TestAgent from "./components/TestAgent";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <FrozenLake mapSize={4} />
    </div>
  );
}

export default App;
