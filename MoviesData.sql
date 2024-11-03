CREATE TABLE movies (
    movies_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    director TEXT NOT NULL
);

CREATE TABLE customers (
    customers_id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
);

CREATE TABLE rentals (
    rentals_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customers_id),
    movie_id INTEGER REFERENCES movies(movies_id),
    rental_date DATE NOT NULL,
    return_date DATE
); 

-- Insert Movies
INSERT INTO movies (title, release_year, genre, director) VALUES
('The Shawshank Redemption', 1994, 'Drama', 'Frank Darabont'),
('The Godfather', 1972, 'Crime', 'Francis Ford Coppola'),
('The Dark Knight', 2008, 'Action', 'Christopher Nolan'),
('Pulp Fiction', 1994, 'Crime', 'Quentin Tarantino'),
('Forrest Gump', 1994, 'Drama', 'Robert Zemeckis');

-- Insert Customers
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john@example.com', '123-456-7890'),
('Jane', 'Smith', 'jane@example.com', '098-765-4321'),
('Alice', 'Johnson', 'alice@example.com', '555-555-5555'),
('Bob', 'Brown', 'bob@example.com', '444-444-4444'),
('Charlie', 'Davis', 'charlie@example.com', '333-333-3333');

-- Insert Rentals
INSERT INTO rentals (customer_id, movie_id, rental_date, return_date) VALUES
(1, 1, '2023-10-01', '2023-10-15'),
(2, 2, '2023-10-02', '2023-10-16'),
(3, 3, '2023-10-03', '2023-10-17'),
(1, 4, '2023-10-04', '2023-10-18'),
(2, 5, '2023-10-05', '2023-10-19'),
(1, 2, '2023-10-06', '2023-10-20'),
(4, 1, '2023-10-07', '2023-10-21'),
(5, 3, '2023-10-08', '2023-10-22'),
(3, 4, '2023-10-09', '2023-10-23'),
(2, 1, '2023-10-10', '2023-10-24');

-- Find all movies rented by a specific customer, given their email:
SELECT movies.title
FROM movies 
JOIN rentals ON movies.movies_id = rentals.movie_id
JOIN customers ON rentals.customer_id = customers.customers_id
WHERE customers.email = 'john@example.com';

-- Given a movie title, list all customers who have rented the movie:
SELECT customers.first_name, customers.last_name
FROM customers
JOIN rentals ON customers.customers_id = rentals.customer_id
JOIN movies ON rentals.movie_id = movies.movies_id
WHERE movies.title = 'The Shawshank Redemption';

-- Get the rental history for a specific movie title:
SELECT c.first_name, c.last_name, r.rental_date, r.return_date
FROM rentals r
JOIN movies m ON r.movie_id = m.movies_id
JOIN customers c ON r.customer_id = c.customers_id
WHERE m.title = 'The Godfather';

-- For a specific movie director, find rental details:
SELECT c.first_name, c.last_name, r.rental_date, m.title
FROM rentals r
JOIN movies m ON r.movie_id = m.movies_id
JOIN customers c ON r.customer_id = c.customers_id
WHERE m.director = 'Quentin Tarantino';

-- List all currently rented out movies (movies whose return dates haven't been met):
SELECT m.title
FROM movies m
JOIN rentals r ON m.movies_id = r.movie_id
WHERE r.return_date > CURRENT_DATE;

