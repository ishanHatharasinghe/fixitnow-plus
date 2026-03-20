import { useState } from "react";
import Home from "./Home";
import About from "./About";
import MiniFindService from "./MiniFindService";
import MiniAddPost from "./MiniAddPost";
import Footer from "../Components/Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Home />
      <About />
      <MiniFindService />
      <MiniAddPost />
      <Footer />
    </>
  );
}

export default App;
