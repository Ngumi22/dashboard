import { getConnection } from "./db";

export async function dbsetupTables() {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS Bernzz;`);
    await connection.query(`USE Bernzz;`); // Switch to the Bernzz database

    // Create the tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id CHAR(36) PRIMARY KEY,
        role_name VARCHAR(255) NOT NULL,
        role_level INT NOT NULL COMMENT '1: Super Admin, 2: Admin, 3: User',
        privileges JSON NOT NULL COMMENT 'Permissions assigned to the role'
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Roles and permissions';
    `);

    await connection.query(`
      INSERT IGNORE INTO roles (role_name, role_level, privileges)
      VALUES
        ('Super Admin', 1, '{"manage_users": true, "crud_operations": true, "role_management": true}'),
        ('Admin', 2, '{"crud_operations": true, "approve_operations": true}'),
        ('User', 3, '{"crud_operations": true, "pending_approval": true}');
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff_accounts (
        id CHAR(36) PRIMARY KEY,
        role_id CHAR(36),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        image TEXT DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_role_id (role_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Staff accounts and user information';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id CHAR(36) PRIMARY KEY,
        staff_id CHAR(36) NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff_accounts(id) ON DELETE CASCADE,
        INDEX idx_session_token (session_token),
        INDEX idx_staff_id (staff_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Session management and tracking';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id CHAR(36) PRIMARY KEY,
        recipient_id CHAR(36) NOT NULL,
        action_by CHAR(36) NOT NULL,
        notification_type ENUM('add', 'update', 'delete') NOT NULL,
        entity_type ENUM('product', 'category', 'slide', 'tag', 'supplier') NOT NULL,
        entity_id CHAR(36) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES staff_accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (action_by) REFERENCES staff_accounts(id) ON DELETE CASCADE,
        INDEX idx_entity_id (entity_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Notifications for actions taken';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image MEDIUMBLOB,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product categories';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand_logo MEDIUMBLOB NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product brands';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_info JSON DEFAULT NULL COMMENT 'Contact details as JSON',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Suppliers and their contact information';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS slides (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        image MEDIUMBLOB DEFAULT NULL COMMENT 'Binary image data',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Slides for marketing';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        short_description TEXT DEFAULT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0.00,
        quantity INT DEFAULT 0,
        status ENUM('draft', 'pending', 'approved') DEFAULT 'draft',
        category_id CHAR(36) NOT NULL,
        brand_id CHAR(36) DEFAULT NULL,
        supplier_id CHAR(36) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_category_id (category_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Products in the catalog';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        image BLOB DEFAULT NULL COMMENT 'Binary image data',
        main_image BOOLEAN DEFAULT FALSE,
        thumbnail_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product images and thumbnails';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tags for products';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        product_id CHAR(36),
        tag_id CHAR(36),
        PRIMARY KEY (product_id, tag_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product tags relationship';
    `);

    // Variant-related tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS variant_types (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Types of product variants (e.g., size, color)';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS variant_options (
        id CHAR(36) PRIMARY KEY,
        variant_type_id CHAR(36) NOT NULL,
        value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (variant_type_id) REFERENCES variant_types(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_variant_type_id (variant_type_id),
        INDEX idx_value (value)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Available options for product variants';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id CHAR(36) PRIMARY KEY,
        product_id CHAR(36) NOT NULL,
        variant_option_id CHAR(36) NOT NULL,
        additional_price DECIMAL(10, 2) DEFAULT 0.00,
        quantity INT DEFAULT 0,
        status ENUM('draft', 'pending', 'approved') DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_option_id) REFERENCES variant_options(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_product_id (product_id),
        INDEX idx_variant_option_id (variant_option_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product variants and their additional pricing';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS variant_images (
        id CHAR(36) PRIMARY KEY,
        variant_id CHAR(36) NOT NULL,
        image BLOB DEFAULT NULL COMMENT 'Binary image data',
        main_image BOOLEAN DEFAULT FALSE,
        thumbnail_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by CHAR(36),
        updated_by CHAR(36),
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(id) ON DELETE SET NULL,
        INDEX idx_variant_id (variant_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Images for product variants';
    `);

    // Create users with specific permissions
    await connection.query(`
      CREATE USER IF NOT EXISTS 'superadmin'@'localhost' IDENTIFIED BY 'superadminpassword';
      GRANT ALL PRIVILEGES ON Bernzz.* TO 'superadmin'@'localhost' WITH GRANT OPTION;
      CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'adminpassword';
      GRANT SELECT, INSERT, UPDATE, DELETE ON Bernzz.* TO 'admin'@'localhost';
      CREATE USER IF NOT EXISTS 'user'@'localhost' IDENTIFIED BY 'userpassword';
      GRANT SELECT, INSERT ON Bernzz.* TO 'user'@'localhost';
    `);

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release();
  }
}
