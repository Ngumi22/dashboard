import { getConnection } from "./db";

export async function setupTables() {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Images Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        main_image MEDIUMBLOB,
        thumbnail1 MEDIUMBLOB,
        thumbnail2 MEDIUMBLOB,
        thumbnail3 MEDIUMBLOB,
        thumbnail4 MEDIUMBLOB,
        thumbnail5 MEDIUMBLOB
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Product Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        status ENUM('Archived', 'Active', 'Draft') DEFAULT 'Draft',
        image_id INT,
        price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        discount INT NOT NULL DEFAULT 0,
        brand VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'User') DEFAULT 'User',
        is_verified BOOLEAN DEFAULT FALSE
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Sessions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Tags Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Product Tags Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        product_id INT,
        tag_id INT,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (tag_id) REFERENCES tags(id),
        PRIMARY KEY (product_id, tag_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('Pending', 'Processing', 'Shipped', 'Completed', 'Canceled') DEFAULT 'Pending',
        total_price DECIMAL(12, 2) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES product(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Inventory Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        stock_level INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Costs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS costs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        cogs DECIMAL(12, 2) NOT NULL, -- Cost of Goods Sold
        FOREIGN KEY (product_id) REFERENCES product(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Wishlists Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES product(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    // Payments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      ) ENGINE=InnoDB CHARSET=utf8mb4;
    `);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error setting up tables:", error);
    throw error; // Propagate the error to be handled by the caller
  } finally {
    connection.release();
  }
}
