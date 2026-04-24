const { pool } = require('./db');

const initDB = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(255) NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       ENUM('Admin','Agent') NOT NULL DEFAULT 'Agent',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS fields (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name       VARCHAR(150) NOT NULL,
      location   VARCHAR(255) NOT NULL,
      size_ha    DECIMAL(10,2) NOT NULL,
      status     ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
      agent_id   INT UNSIGNED DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_fields_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS field_updates (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      field_id   INT UNSIGNED NOT NULL,
      agent_id   INT UNSIGNED NOT NULL,
      stage      VARCHAR(100) NOT NULL,
      notes      TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_fu_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
      CONSTRAINT fk_fu_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('Database tables initialized');
};

module.exports = { initDB };
