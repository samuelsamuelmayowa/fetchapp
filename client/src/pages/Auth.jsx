import usePageMotion from '../lib/usePageMotion';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getNames } from 'country-list';
import { ArrowRightIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Brand from '../components/Brand';
import { api, dashboard, message, saveSession } from '../lib/api';
const countries = getNames().sort();
export default function Auth({ signup = false, role }) {
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [visible, setVisible] = useState(false);
  const chooser = signup && !role;
  const motionRoot = usePageMotion('auth', String(signup) + (role || ''));
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const body = Object.fromEntries(new FormData(event.currentTarget)); if (signup) body.role = role;
      const { data } = await api.post('/auth/' + (signup ? 'signup' : 'login'), body);
      saveSession(data); navigate(dashboard(data.user.role), { replace: true });
    } catch (error) { setError(message(error)); } finally { setBusy(false); }
  }
  return <main ref={motionRoot} className="auth-layout"><aside className="auth-story"><Brand/><div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Small actions.<br/>Bigger<br/><em>possibilities.</em></h1><p>A place for curious people and ambitious creators to move forward, together.</p><div className="auth-benefit"><CheckCircleIcon/> Discover something new every day</div><div className="auth-benefit"><CheckCircleIcon/> Keep your progress in one place</div></div><span className="muted">Made for a connected world.</span></aside><section className="auth-panel"><Link to="/" className="text-link">← Back to home</Link><div className="auth-form"><span className="eyebrow">{signup ? 'JOIN PROMOTtv' : 'GOOD TO SEE YOU AGAIN'}</span><h2>{chooser ? 'Make it your own.' : signup ? 'Your ' + role + ' journey starts here.' : 'Welcome back.'}</h2><p className="muted">{chooser ? 'Choose what brings you here.' : signup ? 'A few details, and you are ready to begin.' : 'Sign in to pick up where you left off.'}</p>
    {chooser ? <div className="role-options"><Link to={'/signup/earner' + (params.get('ref') ? '?ref=' + encodeURIComponent(params.get('ref')) : '')}><span className="role-emoji">↗</span><h3>I want to earn</h3><p>Discover tasks and earn rewards for approved work.</p><ArrowRightIcon/></Link><Link to="/signup/creator"><span className="role-emoji">◎</span><h3>I want to grow</h3><p>Create campaigns and bring your content to more people.</p><ArrowRightIcon/></Link></div> : <form onSubmit={submit}>
      {error && <div className="notice error" role="alert">{error}</div>}
      {signup && <label>Full name<input name="fullName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name"/></label>}
      <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>
      <label>Password<div className="password-field"><input name="password" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : 1} placeholder={signup ? 'At least 8 characters' : 'Your password'}/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeSlashIcon/> : <EyeIcon/>}</button></div></label>
      {signup && <label>Country<select name="country" defaultValue="Nigeria">{countries.map(country => <option key={country}>{country}</option>)}</select></label>}
      {signup && role === 'earner' && <><label>Referral code <span className="muted">(optional)</span><input name="referralCode" defaultValue={params.get('ref') || ''}/></label><label className="checkbox"><input type="checkbox" required/><span>I understand the $10 withdrawal minimum, two-referral requirement, and 30% available-earnings deduction for each inactive UTC day. <Link to="/faq">Read the rules.</Link></span></label></>}
      <button className="button full" disabled={busy}>{busy ? 'Connecting…' : signup ? 'Create account' : 'Sign in'}<ArrowRightIcon/></button>{busy && <p className="field-help" role="status">The server may take a moment to respond.</p>}
    </form>}<p className="auth-switch">{signup ? 'Already part of the community?' : 'New to PROMOTtv?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p></div><small className="muted">Your next opportunity is a little closer.</small></section></main>;
}
