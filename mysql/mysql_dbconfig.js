let mysql = require('mysql');

const config_mysql = {
    user: 'root',
    password: '',
    database:'roulettetournament',
    host: '30.0.0.78',
    // host: '30.0.0.82',
    // host: '192.168.101.41',
    port: 3306,
    connectTimeout: 20000,
}

const connection = mysql.createPool(config_mysql)

// Attempt to connect to the database (optional)
connection.getConnection((err, conn) => {
  try {
    if (err) {
      console.error('Error connecting to the database:', err.message);
      if (conn) conn.release();
      // conn.release();
      return;
    }

    console.log('Connected to MySQL DB SLOT TNM!');
    // Don't forget to release the connection when you're done with it
    conn.release();
  } catch (error) {
    console.log(error)
  }
  finally {
    // console.log('finally connection')
  }
});



//SHOW ALL TABLE & FIELDS 
function getAllTables() {
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error fetching tables:', err.message);
      return;
    }
    const tables = results.map(row => Object.values(row)[0]);
    console.log('Tables in the database:', tables);

    // Now fetch columns for each table
    tables.forEach(table => {
      getTableColumns(table);
    });
  });
}
// Function to get all columns for a specific table
function getTableColumns(table) {
  connection.query(`SHOW COLUMNS FROM ${table}`, (err, results) => {
    if (err) {
      console.error(`Error fetching columns for table ${table}:`, err.message);
      return;
    }

    console.log(`Columns in ${table}:`, results);
  });
}


// Call the function to list all tables and columns
// getAllTables();



// Handle errors emitted by the connection pool
connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  // Optionally, you can attempt to reconnect or take other appropriate actions based on the error
});


module.exports = connection;