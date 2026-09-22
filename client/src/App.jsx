import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Landing';
import Auth from './pages/Auth';
import Workspace from './pages/Workspace';
import Info from './pages/Info';
export default function App() {
  return <BrowserRouter><Toaster richColors position="top-right"/><Routes>
    <Route path="/" element={<Home/>}/><Route path="/login" element={<Auth/>}/>
    <Route path="/signup" element={<Auth signup/>}/><Route path="/signup/earner" element={<Auth signup role="earner"/>}/><Route path="/signup/creator" element={<Auth signup role="creator"/>}/>
    <Route path="/earner-dashboard" element={<Workspace role="earner"/>}/><Route path="/creator-dashboard" element={<Workspace role="creator"/>}/><Route path="/admin" element={<Workspace role="staff"/>}/>
    <Route path="/faq" element={<Info/>}/><Route path="/read-more" element={<Info/>}/><Route path="*" element={<Info missing/>}/>
  </Routes></BrowserRouter>;
}
