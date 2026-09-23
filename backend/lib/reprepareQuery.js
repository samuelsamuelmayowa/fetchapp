// Sequelize 6/mysql2: discard a stale statement before retrying error 1615.
// Keep bound parameters and the same connection/transaction. Other errors fail normally.
module.exports = BaseQuery => class ReprepareQuery extends BaseQuery {
  async run(sql, parameters) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await super.run(sql, parameters);
      } catch (error) {
        const cause = error.original || error.parent;
        if (cause?.code !== 'ER_NEED_REPREPARE' || attempt >= 2) throw error;
        this.connection.unprepare(sql);
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
};
