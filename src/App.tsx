import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Hello";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Gaming from "./pages/secret-fun/gaming";
import Music from "./pages/secret-fun/music";
import Notes from "./pages/secret-fun/notes";
import Osu from "./pages/secret-fun/osu!";
import Read from "./pages/secret-fun/read";
import Watch from "./pages/secret-fun/watch";
import TrueSecret from "./pages/true-secret/true-secret";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/secret-fun/osu" element={<Osu />} />
            <Route path="/secret-fun/gaming" element={<Gaming />} />
            <Route path="/secret-fun/music" element={<Music />} />
            <Route path="/secret-fun/notes" element={<Notes />} />
            <Route path="/secret-fun/read" element={<Read />} />
            <Route path="/secret-fun/watch" element={<Watch />} />
            <Route path="/true-secrets" element={<TrueSecret />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
