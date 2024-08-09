import { getConnection } from "./db";

export async function setupTables() {
  const connection = await getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        main_image MEDIUMBLOB,
        thumbnail1 MEDIUMBLOB,
        thumbnail2 MEDIUMBLOB,
        thumbnail3 MEDIUMBLOB,
        thumbnail4 MEDIUMBLOB,
        thumbnail5 MEDIUMBLOB
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        status ENUM('Archived', 'Active', 'Draft') DEFAULT 'Draft',
        image_id INT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        discount INT NOT NULL DEFAULT 0,
        brand VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        product_id INT,
        tag_id INT,
        FOREIGN KEY (product_id) REFERENCES product(id),
        FOREIGN KEY (tag_id) REFERENCES tags(id),
        PRIMARY KEY (product_id, tag_id)
      );
    `);
  } finally {
    connection.release();
  }
}
