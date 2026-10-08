import { useState } from "react";
import "./App.css";
import Headers from "./Headers";
import Ny_anv from "./Ny_anv";
import Hämta_anv from "./Hämta_anv";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Headers />
      <Ny_anv />
      <Hämta_anv />
    </>
  );
}

export default App;
