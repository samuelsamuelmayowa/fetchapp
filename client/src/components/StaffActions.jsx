import { useState } from 'react';
import { api } from '../lib/api';
export default function StaffActions({ user, busy, action }) {
  const [resetting, setResetting] = useState(false);
  return <div><div className="row-actions"><button disabled={busy} onClick={() => action(() => api.patch('/workspace/admin/staff/' + user.id, { suspended: !user.suspended }), 'Staff access updated.')}>{user.suspended ? 'Restore access' : 'Suspend access'}</button><button onClick={() => setResetting(!resetting)}>Reset password</button></div>{resetting && <form onSubmit={async event => { event.preventDefault(); const password = new FormData(event.currentTarget).get('password'); if (await action(() => api.patch('/workspace/admin/staff/' + user.id, { password }), 'Staff password reset; prior sessions revoked.')) setResetting(false); }}><label>New staff password<input name="password" type="password" autoComplete="new-password" minLength={12} required/></label><button className="button small" disabled={busy}>Save new password</button></form>}</div>;
}
