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
      customer_id INTEGER REFERENCES customers(customers_id),
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
};

/**
 * Rents a movie by creating a new record in the rentals table.
 * 
 * @param {number} customerId - ID of the customer renting the movie
 * @param {number} movieId - ID of the movie to be rented
 */
async function rentMovie(customerId, movieId) {
  try {
    const rentalDate = new Date().toISOString().split('T')[0];
    const query = `
      INSERT INTO rentals (customer_id, movie_id, rental_date)
      VALUES ($1, $2, $3);
    `;
    await pool.query(query, [customerId, movieId, rentalDate]);
    console.log(`Movie ${movieId} rented to Customer ${customerId} on ${rentalDate}.`);
  } catch (error) {
    console.error('Error renting movie:', error);
  }
}

/**
 * Returns a rented movie by updating the return_date in the rentals table.
 * 
 * @param {number} rentalId - ID of the rental record
 */
async function returnMovie(rentalId) {
  try {
    const returnDate = new Date().toISOString().split('T')[0];
    const query = `
      UPDATE rentals
      SET return_date = $1
      WHERE rentals_id = $2 AND return_date IS NULL;
    `;
    const result = await pool.query(query, [returnDate, rentalId]);
    if (result.rowCount > 0) {
      console.log(`Rental ${rentalId} returned on ${returnDate}.`);
    } else {
      console.log(`Rental ${rentalId} not found or already returned.`);
    }
  } catch (error) {
    console.error('Error returning movie:', error);
  }
}

/**
 * Displays all rentals in the database, including customer and movie details.
 */
async function displayRentals() {
  try {
    const query = `
      SELECT 
        rentals.rentals_id,
        customers.first_name || ' ' || customers.last_name AS customer_name,
        movies.title AS movie_title,
        rentals.rental_date,
        rentals.return_date
      FROM rentals
      JOIN customers ON rentals.customer_id = customers.customers_id
      JOIN movies ON rentals.movie_id = movies.movies_id
      ORDER BY rentals.rental_date DESC;
    `;
    const result = await pool.query(query);
    console.table(result.rows);
  } catch (error) {
    console.error('Error displaying rentals:', error);
  }
}


/**
 * Clears all data from the tables.
 */
async function clearData() {
  try {
    // Delete all rows from rentals first due to foreign key constraints
    await pool.query('DELETE FROM rentals;');
    await pool.query('DELETE FROM customers;');
    await pool.query('DELETE FROM movies;');

    console.log('All data cleared from movies, customers, and rentals tables.');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};


/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log('Movie Rental Database CLI Help');
  console.log('===================================');
  console.log('Commands:');
  
  console.log('\n  insert movie <title> <year> <genre> <director>');
  console.log('    - Inserts a new movie into the database.');
  console.log('    - Example: node index.js insert movie "Inception" 2010 "Sci-Fi" "Christopher Nolan"\n');
  
  console.log('  insert customer <first_name> <last_name> <email> <phone>');
  console.log('    - Inserts a new customer into the database.');
  console.log('    - Example: node index.js insert customer "John" "Doe" "john@example.com" "123-456-7890"\n');
  
  console.log('  show movies');
  console.log('    - Displays all movies in the database.');
  console.log('    - Example: node index.js show movies\n');
  
  console.log('  show customers');
  console.log('    - Displays all customers in the database.');
  console.log('    - Example: node index.js show customers\n');
  
  console.log('  show rentals');
  console.log('    - Displays all rentals in the database, including customer and movie details.');
  console.log('    - Example: node index.js show rentals\n');
  
  console.log('  update <customer_id> <new_email>');
  console.log('    - Updates a customer\'s email address by customer ID.');
  console.log('    - Example: node index.js update 1 "newemail@example.com"\n');
  
  console.log('  remove <customer_id>');
  console.log('    - Removes a customer and their rental history from the database by customer ID.');
  console.log('    - Example: node index.js remove 1\n');
  
  console.log('  rent <customer_id> <movie_id>');
  console.log('    - Rents a movie to a customer by creating a new rental record.');
  console.log('    - Example: node index.js rent 1 3\n');
  
  console.log('  return <rental_id>');
  console.log('    - Returns a rented movie by updating the return_date in the rentals table.');
  console.log('    - Example: node index.js return 1\n');
  
  console.log('  clear');
  console.log('    - Clears all data from the movies, customers, and rentals tables.');
  console.log('    - Example: node index.js clear\n');
  
  console.log('===================================');
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
        await insertCustomer(args[2], args[3], args[4], args[5]);
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
        } else if (args[1] === 'rentals') {
          await displayRentals();
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
    case 'rent':
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await rentMovie(parseInt(args[1]), parseInt(args[2]));
      break;
    case 'return':
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await returnMovie(parseInt(args[1]));
      break;
    case 'clear':
      await clearData();
      break;
    default:
      printHelp();
      break;
    }
  };

runCLI();
