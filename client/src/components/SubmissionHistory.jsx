export default function SubmissionHistory({ submissions }) {
  return <section className="panel" style={{ marginTop: 24 }}><h2>Your submissions</h2>{submissions.length ? <div className="table-scroll"><table><thead><tr><th>Task</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{submissions.map(s => <tr key={s.id}><td>Task #{s.taskId}</td><td>{new Date(s.createdAt).toLocaleString()}</td><td><span className={'status ' + s.status}>{s.status}</span></td></tr>)}</tbody></table></div> : <p>You haven’t submitted any tasks yet. Your review progress will appear here.</p>}</section>;
}
