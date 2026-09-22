import { useState } from 'react';
import { api, message } from '../lib/api';
import { toast } from 'sonner';
export default function PaymentRecovery({ onVerified }) {
  const [busy, setBusy] = useState(false);
  async function verify(event) {
    event.preventDefault(); setBusy(true);
    try {
      await api.post('/payments/verify', { transactionId: new FormData(event.currentTarget).get('transactionId') });
      toast.success('Payment verified.'); await onVerified();
    } catch (error) { toast.error(message(error)); } finally { setBusy(false); }
  }
  return <section className="panel"><h2>Paid, but your balance hasn’t updated?</h2><p>Use the Flutterwave transaction ID from your completed checkout. Only a verified payment belonging to your account can update your balance.</p><form onSubmit={verify}><label>Flutterwave transaction ID<input name="transactionId" inputMode="numeric" pattern="[0-9]+" required placeholder="Transaction ID"/></label><button className="button secondary" disabled={busy}>{busy ? 'Verifying…' : 'Verify payment'}</button></form></section>;
}
