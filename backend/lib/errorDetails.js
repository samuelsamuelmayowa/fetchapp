// Log diagnostic codes, never SQL, bindings, request bodies, or database values.
module.exports = function errorDetails(error) {
  const database = error.original || error.parent;
  const details = { name: error.name };
  if (!database) return details;
  if (/^[A-Z0-9_]+$/.test(database.code || '')) details.code = database.code;
  if (Number.isInteger(database.errno)) details.errno = database.errno;
  if (/^[A-Z0-9]{5}$/.test(database.sqlState || '')) details.sqlState = database.sqlState;
  if (database.code === 'ER_BAD_FIELD_ERROR') {
    const match = /^Unknown column '([A-Za-z0-9_.]+)'/.exec(database.sqlMessage || '');
    if (match) details.column = match[1];
  }
  return details;
};
