const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres', //This _should_ be your username, as it's the default one Postgres uses
  host: 'localhost',
  database: 'moviesrentaldata', //This should be changed to reflect your actual database
  password: '44Aust1n##', //This should be changed to reflect the password you used when setting up Postgres
  port: 5432,
});

/**
 * Creates the database tables, if they do not already exist.
 */
// Create Tables if they don't exist
async function createTable() {
  const createMoviesTable = `
    CREATE TABLE IF NOT EXISTS movies (
      movies_id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      genre TEXT NOT NULL,
      director TEXT NOT NULL
    );
  `;
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      customers_id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT
    );
  `;
  const createRentalsTable = `
    CREATE TABLE IF NOT EXISTS rentals (
      rentals_id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(customers_id) ON DELETE CASCADE,
      movie_id INTEGER REFERENCES movies(movies_id),
      rental_date DATE NOT NULL,
      return_date DATE
    );
  `;
  await pool.query(createMoviesTable);
  await pool.query(createCustomersTable);
  await pool.query(createRentalsTable);
}

/**
 * Inserts a new movie into the Movies table.
 * 
 * @param {string} title Title of the movie
 * @param {number} year Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} director Director of the movie
 */
async function insertMovie(title, year, genre, director) {
  try {
    const query = `
      INSERT INTO movies (title, release_year, genre, director)
      VALUES ($1, $2, $3, $4);
    `;
    await pool.query(query, [title, year, genre, director]);
    console.log(`Movie "${title}" added successfully.`);
  } catch (error) {
    console.error('Error inserting movie:', error);
  }
}

/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  try {
    const result = await pool.query('SELECT * FROM movies;');
    console.table(result.rows);
  } catch (error) {
    console.error('Error displaying movies:', error);
  }
}

/**
 * Inserts a new customer into the Customers table.
 * 
 * @param {string} firstName First name of the customer
 * @param {string} lastName Last name of the customer
 * @param {string} email Email address of the customer
 * @param {string} phone Phone number of the customer
 */
async function insertCustomer(firstName, lastName, email, phone) {
  try {
    const query = `
      INSERT INTO customers (first_name, last_name, email, phone)
      VALUES ($1, $2, $3, $4);
    `;
    await pool.query(query, [firstName, lastName, email, phone]);
    console.log(`Customer "${firstName} ${lastName}" added successfully.`);
  } catch (error) {
    console.error('Error inserting customer:', error);
  }
}

/**
 * Displays all customers in the database.
 */
async function displayCustomers() {
  try {
    const query = `
      SELECT 
        customers_id, first_name, last_name, email, phone
      FROM customers
      ORDER BY customers_id;
    `;
    const result = await pool.query(query);
    console.table(result.rows);
  } catch (error) {
    console.error('Error displaying customers:', error);
  }
}


/**
 * Updates a customer's email address.
 * 
 * @param {number} customerId ID of the customer
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  try {
    const query = `
      UPDATE customers
      SET email = $1
      WHERE customers_id = $2;
    `;
    const result = await pool.query(query, [newEmail, customerId]);
    if (result.rowCount > 0) {
      console.log(`Customer ${customerId} email updated to "${newEmail}".`);
    } else {
      console.log(`Customer ${customerId} not found.`);
    }
  } catch (error) {
    console.error('Error updating customer email:', error);
  }
};

/**
 * Removes a customer from the database along with their rental history.
 * 
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  try {
    const query = `
      DELETE FROM customers
      WHERE customers_id = $1;
    `;
    const result = await pool.query(query, [customerId]);
    if (result.rowCount > 0) {
      console.log(`Customer ${customerId} removed successfully.`);
    } else {
      console.log(`Customer ${customerId} not found.`);
    }
  } catch (error) {
    console.error('Error removing customer:', error);
  }
}

/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log('Usage:');
  console.log('  insert <title> <year> <genre> <director> - Insert a movie');
  console.log('  show - Show all movies');
  console.log('  update <customer_id> <new_email> - Update a customer\'s email');
  console.log('  remove <customer_id> - Remove a customer from the database');
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'insert':
      if (args.length < 5) {
        printHelp();
        return;
      }
      if (args[1] === 'movie') {
        await insertMovie(args[2], parseInt(args[3]), args[4], args[5]);
      } else if (args[1] === 'customer') {
        await insertCustomer(args[2], args[3], args[4], args[5]); // Assuming you have this function
      } else {
        printHelp();
      }
      break;
    case 'show':
      if (args.length === 2) {
        if (args[1] === 'movies') {
          await displayMovies();
        } else if (args[1] === 'customers') {
          await displayCustomers();
        } else {
          printHelp();
        }
      } else {
        printHelp();
      }
      break;
    case 'update':
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await updateCustomerEmail(parseInt(args[1]), args[2]);
      break;
    case 'remove':
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await removeCustomer(parseInt(args[1]));
      break;
    default:
      printHelp();
      break;
  }
};


runCLI();
