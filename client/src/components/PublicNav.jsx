import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Brand from './Brand';
export default function PublicNav() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-inner"><Brand/><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen(!open)}>{open ? <XMarkIcon/> : <Bars3Icon/>}</button><nav id="public-navigation" className={open ? 'public-nav open' : 'public-nav'} onClick={() => setOpen(false)}><a href="/#how-it-works">How it works</a><a href="/#creators">For creators</a><Link to="/faq">FAQs</Link><Link className="nav-login" to="/login">Log in</Link><Link className="button small" to="/signup">Get started <ArrowUpRightIcon/></Link></nav></div></header>;
}
