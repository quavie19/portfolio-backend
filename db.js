const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'jaquavia',
  host: 'localhost',
  port: 5432,
  database: 'portfolio-app',
});

module.exports = pool;
