import mysql from 'mysql2/promise';

let _database : mysql.Connection | undefined;

async function createConnection(): Promise<mysql.Connection> {
  return await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
  });
}

async function validateConnection() {
   try {
      await _database?.execute("SELECT 1");
   } catch (e) {
      _database = await createConnection();
   }
}

async function database (): Promise<mysql.Connection> {
   if(!_database) {
      _database = await createConnection();
   }

   await validateConnection();

   return _database;
}

async function createTables() {
   let connection = await database();

   connection.query("CREATE TABLE IF NOT EXISTS permissions (id INT(11) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, user_id BIGINT(18) UNSIGNED  NOT NULL, server_id CHAR(8) NOT NULL)");
}

export {database, createTables};