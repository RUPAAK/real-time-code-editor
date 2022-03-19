import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import EditorPage from "./screens/EditorPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#4aed88",
              },
            },
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/editor/:id" element={<EditorPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
