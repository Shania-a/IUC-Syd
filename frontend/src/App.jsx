import { useState } from "react";
import "./App.css";
import Headers from "./Global_function/Headers";
import Log_in from "./Sign_in/Log_in";
import Footer from "./Global_function/Footer";

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
