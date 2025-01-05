import { getConnection } from "./initDb";

export async function dbsetupTables() {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS Bernzzz;`);
    await connection.query(`USE Bernzzz;`);

    // Create the tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff_accounts (
          staff_id INT AUTO_INCREMENT PRIMARY KEY,
          role_name ENUM('super_admin', 'admin', 'user') NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(20),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          image MEDIUMBLOB,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          INDEX idx_email (email),
          INDEX idx_role_name (role_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Staff accounts and user information';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(20),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          image MEDIUMBLOB,
          is_verified BOOLEAN DEFAULT FALSE,
          password_last_changed TIMESTAMP DEFAULT NULL,
          password_expiration_date TIMESTAMP DEFAULT NULL;
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_is_verified (is_verified),
          INDEX idx_name (first_name, last_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User accounts and user information';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_invitations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invited_email VARCHAR(255) NOT NULL UNIQUE,
          role_id INT NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User invitations by super_admin';
    `);

    await connection.query(`
     CREATE TABLE IF NOT EXISTS roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          role_name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )  ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Roles';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          role_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_role (user_id, role_id),
          INDEX idx_user_id (user_id),
          INDEX idx_role_id (role_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User Roles';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          entity_name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_entity_name (entity_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Entities';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS actions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          action_name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_action_name (action_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Actions';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            entity_id INT NOT NULL,
            action_id INT NOT NULL,
            has_permission BOOLEAN NOT NULL DEFAULT FALSE,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
            FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
            UNIQUE KEY unique_role_entity_action (role_id, entity_id, action_id),
            INDEX idx_entity_id (entity_id),
            INDEX idx_action_id (action_id),
            INDEX idx_has_permission (has_permission)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User permissions';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
          session_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          session_token VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45), -- Supports IPv4 and IPv6
          user_agent TEXT, -- Stores information about the user's browser or device
          is_valid BOOLEAN DEFAULT TRUE, -- Indicates if the session is still valid
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_is_valid (is_valid),
          INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Session management and tracking';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL, -- Target user for the notification
          title VARCHAR(255) NOT NULL, -- Notification title
          message TEXT, -- Detailed notification message
          type ENUM('info', 'warning', 'error', 'success') NOT NULL, -- Notification type
          is_read BOOLEAN DEFAULT FALSE, -- Read/unread status
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Notification creation time
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Notifications for actions taken';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS brands (
            brand_id INT AUTO_INCREMENT PRIMARY KEY,
            brand_name VARCHAR(255) NOT NULL,
            brand_image MEDIUMBLOB NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL,
            created_by INT DEFAULT NULL,
            updated_by INT DEFAULT NULL,
            FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
            FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
            INDEX idx_name (brand_name)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product brands';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          supplier_id INT AUTO_INCREMENT PRIMARY KEY,
          supplier_name VARCHAR(255) NOT NULL,
          supplier_email VARCHAR(255) NOT NULL UNIQUE,
          supplier_phone_number VARCHAR(255) NOT NULL,
          supplier_location TEXT NOT NULL,
          created_at TIMESTAMP NULL DEFAULT NULL,
          updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          INDEX idx_name (supplier_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Suppliers and their contact information';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          product_id INT AUTO_INCREMENT PRIMARY KEY,
          product_name VARCHAR(255) NOT NULL,
          product_sku VARCHAR(255) NOT NULL UNIQUE,
          product_description TEXT,
          product_price DECIMAL(10, 2) NOT NULL,
          product_discount DECIMAL(10, 2) DEFAULT 0.00,
          product_quantity INT DEFAULT 0,
          product_status ENUM('draft', 'pending', 'approved') DEFAULT 'draft',
          category_id INT,
          brand_id INT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL ON UPDATE CASCADE,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL ON UPDATE CASCADE,
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL ON UPDATE CASCADE,
          INDEX idx_name (product_name),
          INDEX idx_sku (product_sku),
          INDEX idx_category_id (category_id)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Products data';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          product_image_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          main_image MEDIUMBLOB NOT NULL,
          thumbnail_image1 MEDIUMBLOB NOT NULL,
          thumbnail_image2 MEDIUMBLOB NOT NULL,
          thumbnail_image3 MEDIUMBLOB NOT NULL,
          thumbnail_image4 MEDIUMBLOB NOT NULL,
          thumbnail_image5 MEDIUMBLOB NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product images and thumbnails';
      `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_suppliers (
        product_id INT NOT NULL,
        supplier_id INT NOT NULL,
        PRIMARY KEY (product_id, supplier_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Mapping of products to suppliers';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS specifications (
          specification_id INT AUTO_INCREMENT PRIMARY KEY,
          specification_name VARCHAR(255) NOT NULL UNIQUE, -- Name of the specification (e.g., "RAM")
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS category_specifications (
          category_spec_id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          specification_id INT NOT NULL,
          UNIQUE KEY (category_id, specification_id),
          FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_specifications (
          product_spec_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          specification_id INT NOT NULL,
          value VARCHAR(255) NOT NULL, -- The value of the specification (e.g., "16GB")
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_product_specification (product_id, specification_id),
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
          tag_id INT AUTO_INCREMENT PRIMARY KEY,
          tag_name VARCHAR(255) NOT NULL,
          INDEX idx_name (tag_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tags for products';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_tags (
          product_tag_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          tag_id INT NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id),
          FOREIGN KEY (tag_id) REFERENCES tags(tag_id),
          INDEX idx_product_id (product_id),
          INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product tags relationship';
    `);

    // Create the variant_types table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS variant_types (
          variant_type_id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          variant_type_name VARCHAR(255) NOT NULL,
          variant_type_description VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
          UNIQUE KEY category_variant (category_id, variant_type_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Variant types associated with categories';
    `);

    // Create the variants table to hold each product variant
    await connection.query(`
      CREATE TABLE IF NOT EXISTS variants (
        variant_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_type_id INT NOT NULL,
        variant_value VARCHAR(255) NOT NULL,  -- Stores the actual value (e.g., "16GB", "Red", "Core i7")
        variant_price DECIMAL(10, 2) DEFAULT 0.00,
        variant_quantity INT DEFAULT 0,
        variant_status ENUM('active', 'inactive') DEFAULT 'active',
        variant_image MEDIUMBLOB NULL,  -- Optional image for the variant
        variant_thumbnail1 MEDIUMBLOB NULL,  -- Optional thumbnails (if you want to allow multiple images)
        variant_thumbnail2 MEDIUMBLOB NULL,  -- Additional optional thumbnails
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (variant_type_id) REFERENCES variant_types(variant_type_id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_variant_type_id (variant_type_id)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product variants with optional images';
  `);

    // Customer-related tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
          customer_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_email VARCHAR(255) NOT NULL UNIQUE,
          customer_password_hash TEXT NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          INDEX idx_customer_email (customer_email)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer accounts';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
          customer_address_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT NOT NULL,
          address_line1 TEXT NOT NULL,
          address_line2 TEXT,
          customer_phone_number VARCHAR(255) NOT NULL,
          dial_code VARCHAR(100) NOT NULL,
          country VARCHAR(255) NOT NULL,
          postal_code VARCHAR(255) NOT NULL,
          city VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_customer_id (customer_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer addresses';
    `);

    // Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
          review_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          customer_id INT NOT NULL,
          rating INT CHECK(rating BETWEEN 1 AND 5),
          comment TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(product_id),
          FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
          INDEX idx_rating_product (product_id, rating),
          INDEX idx_created_at (createdAt)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product reviews';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
          coupon_id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          discount_value DECIMAL(10, 2),
          discount_type VARCHAR(50) NOT NULL,
          times_used INT NOT NULL DEFAULT 0,
          max_usage INT DEFAULT NULL,
          order_amount_limit DECIMAL(10, 2) DEFAULT NULL,
          coupon_start_date TIMESTAMP NOT NULL,
          coupon_end_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_code (code),
          CHECK (coupon_start_date <= coupon_end_date)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Coupon details and usage';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_coupons (
            product_coupon_id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            coupon_id INT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL,
            created_by INT,
            updated_by INT,
            FOREIGN KEY (product_id) REFERENCES products(product_id),
            FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
            FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
            FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
            INDEX idx_product_id (product_id),
            INDEX idx_coupon_id (coupon_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Relation between products and coupons';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_statuses (
          order_status_id INT AUTO_INCREMENT PRIMARY KEY,
          status_name VARCHAR(255) NOT NULL,
          color VARCHAR(50) NOT NULL,
          privacy ENUM('public', 'private') NOT NULL DEFAULT 'private',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_status_name (status_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Order status metadata';
    `);

    await connection.query(`
     CREATE TABLE IF NOT EXISTS orders (
          order_id INT AUTO_INCREMENT PRIMARY KEY,
          coupon_id INT,
          customer_id INT,
          order_status_id INT,
          order_approved_at TIMESTAMP DEFAULT NULL,
          order_delivered_carrier_date TIMESTAMP DEFAULT NULL,
          order_delivered_customer_date TIMESTAMP DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          updated_by INT,
          FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
          FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
          FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_customer_id (customer_id),
          INDEX idx_coupon_id (coupon_id),
          INDEX idx_order_status_id (order_status_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Order details and statuses';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
          order_item_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          order_id INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id),
          FOREIGN KEY (order_id) REFERENCES orders(order_id),
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_product_id (product_id),
          INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Items in an order';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS carousels (
        carousel_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT 'Title of the product or slide',
        short_description VARCHAR(500) DEFAULT NULL COMMENT 'Short description of the product',
        description VARCHAR(500) DEFAULT NULL COMMENT 'description of the product',
        link VARCHAR(255) DEFAULT NULL COMMENT 'Link that the button leads to',
        image MEDIUMBLOB DEFAULT NULL COMMENT 'Image for the carousel slide',
        text_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Text color in hex format (default is black)',
        background_color VARCHAR(7) DEFAULT '#FFFFFF' COMMENT 'Background color in hex format (default is white)',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Status of the carousel slide',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
        INDEX idx_title (title)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Hero section carousel slides';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS banners (
        banner_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT 'Title for the banner',
        description VARCHAR(500) DEFAULT NULL COMMENT 'Small description for the banner',
        link VARCHAR(255) DEFAULT NULL COMMENT 'Link the banner will lead to when clicked',
        image MEDIUMBLOB DEFAULT NULL COMMENT 'Image for the banner',
        text_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Text color in hex format (default is black)',
        background_color VARCHAR(7) DEFAULT '#FFFFFF' COMMENT 'Background color in hex format (default is white)',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Status of the banner',
        usage_context VARCHAR(255) DEFAULT NULL COMMENT 'Custom usage context defined by the user',
        related_id INT DEFAULT NULL COMMENT 'ID of the related entity (e.g., product ID, category ID, or brand ID)',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
        INDEX idx_title (title),
        INDEX idx_usage_context (usage_context),
        INDEX idx_related_id (related_id)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Banners for various sections of the site';
    `);

    await connection.commit();
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
    await connection.rollback();
  } finally {
    connection.release();
  }
}
