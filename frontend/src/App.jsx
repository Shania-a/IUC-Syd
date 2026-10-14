import { useState } from "react";
import "./App.css";
import Headers from "./Headers";
import Log_in from "./Log_in";
import Footer from "./Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Headers />
      <Log_in />
      <Footer />
    </>
  );
}

export default App;
