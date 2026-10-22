import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Headers from "./Global_function/Headers";
import Log_in from "./Sign_in/Log_in";
import Footer from "./Global_function/Footer";
import Sign_up from "./register/Sign_up";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Headers />

      <Routes>
        <Route path="/" element={<Log_in />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
