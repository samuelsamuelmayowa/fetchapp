import { Link } from 'react-router-dom';
import Navbar from '../components/PublicNav';
export default function Info({ missing = false }) {
  return <><Navbar/><main className="container section info-page"><span className="eyebrow">PROMOTtv HELP</span><h1>{missing ? 'This page has moved.' : 'A few things to know.'}</h1>{missing ? <p>Use the navigation or return home to find your next step.</p> : <div className="info-grid">
    <article className="panel"><h2>Earning & verification</h2><p>Add a social profile in Settings before submitting tasks. Follow each campaign’s instructions and provide evidence of completion. A moderator reviews your submission before crediting rewards. A submission alone is not a guaranteed reward.</p></article>
    <article className="panel"><h2>Withdrawals & referrals</h2><p>The minimum withdrawal is $10. Two people must register through your referral link and remain unsuspended. Your requested amount is reserved while finance reviews the request. Crypto payouts currently use USDT on TRON (TRC20); confirm the network and address carefully.</p></article>
    <article className="panel"><h2>Daily activity</h2><p>Each complete UTC day without a non-rejected task submission results in a 30% deduction from your available earnings. Your registration day is a grace day. Pending submissions count as activity. Reserved withdrawal funds are excluded. Each deduction appears in your transaction history.</p></article>
    <article className="panel"><h2>Creator campaigns</h2><p>Fund your wallet through Flutterwave and publish a campaign. Half of a creator campaign’s budget is allocated to task rewards; the other half goes to the platform. Membership discounts apply only after verified payment. Premium is $20 and Diamond is $30 for 30 days.</p></article>
    <article className="panel"><h2>Platform campaigns</h2><p>Platform-funded campaigns allocate 20% of their stated budget to task rewards. The reward is displayed before you submit work. Rewards vary by campaign and action.</p></article>
    <article className="panel"><h2>Your account</h2><p>Use your own social accounts and submit honest evidence. Staff may suspend accounts that violate platform rules. Change your password in Settings. Staff access is limited by role, and account actions are recorded.</p></article>
  </div>}<Link className="button" to="/">Back to home</Link></main></>;
}
