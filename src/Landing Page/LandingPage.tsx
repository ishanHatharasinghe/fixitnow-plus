import Home from "./Home";
import About from "./About";
import MiniFindService from "./MiniFindService";
import MiniAddPost from "./MiniAddPost";
import Footer from "../Components/Footer";

function App() {
  return (
    <>
      <div id="home">
        <Home />
      </div>
      <div id="about">
        <About />
      </div>
      <MiniFindService />
      <MiniAddPost />
      <div id="contact" className="h-0" />
    </>
  );
}

export default App;
