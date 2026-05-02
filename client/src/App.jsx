import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./components/Signup";
import EarnerSignup from "./components/EarnerSignup";
import CreatorSignup from "./components/CreatorSignup";
import Login from "./components/Login";
import EarnerDashboard from "./pages/EarnerDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/earner" element={<EarnerSignup />} />
        <Route path="/signup/creator" element={<CreatorSignup />} />

        <Route path="/login" element={<Login />} />


  <Route path="/earner-dashboard" element={<EarnerDashboard />} />
  <Route path="/creator-dashboard" element={<CreatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Signup from "./components/Signup";
// import EarnerSignup from "./components/EarnerSignup";
// import CreatorSignup from "./components/CreatorSignup";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />

//         {/* Signup flow */}
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/signup/earner" element={<EarnerSignup />} />
//         <Route path="/signup/creator" element={<CreatorSignup />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import Home from "./pages/Home";
// // import Signup from "./components/Signup";


// // function App() {
// //   return (
// //     <BrowserRouter>


// //       <Routes>
// //          <Route path="/signup" element={<Signup/>} />
// //         <Route path="/" element={<Home />} />
      
// //       </Routes>

// //       {/* <Footer /> */}
// //     </BrowserRouter>
// //   );
// // }

// // export default App;