import { query } from "./initDb";

export async function dbsetupTables() {
  try {
    // Create the database if it doesn't exist
    await query(`CREATE DATABASE IF NOT EXISTS bernzzz`);

    // Users and authentication tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'editor', 'admin') NOT NULL DEFAULT 'user',
        email_verified BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        password_changed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS allowed_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        revoked_at DATETIME,
        user_agent TEXT,
        ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        success BOOLEAN DEFAULT FALSE,
        ip VARCHAR(45),
        user_agent TEXT,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip VARCHAR(45) NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_ip (email, ip),
        INDEX idx_attempt_time (attempt_time)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Product catalog tables
    await query(`
      CREATE TABLE IF NOT EXISTS brands (
        brand_id INT AUTO_INCREMENT PRIMARY KEY,
        brand_name VARCHAR(255) NOT NULL,
        brand_image MEDIUMBLOB NOT NULL,
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_brand_name (brand_name),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        category_name VARCHAR(255) NOT NULL,
        category_image MEDIUMBLOB NOT NULL,
        category_description VARCHAR(255) NOT NULL,
        category_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        parent_category_id INT NULL,
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category_name (category_name),
        INDEX idx_parent_category (parent_category_id),
        INDEX idx_status (category_status)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL,
        supplier_email VARCHAR(255) NOT NULL UNIQUE,
        supplier_phone_number VARCHAR(20) NOT NULL,
        supplier_location VARCHAR(255) NOT NULL,
        created_by INT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_supplier_name (supplier_name),
        INDEX idx_supplier_email (supplier_email)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(255) NOT NULL UNIQUE,
        product_description TEXT,
        long_description TEXT,
        product_price DECIMAL(10, 2) NOT NULL,
        product_discount DECIMAL(10, 2) DEFAULT 0.00,
        product_quantity INT DEFAULT 0,
        product_status ENUM('draft', 'pending', 'approved') DEFAULT 'draft',
        category_id INT NOT NULL,
        subcategory_id INT NULL,
        brand_id INT,
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
        FOREIGN KEY (subcategory_id) REFERENCES categories(category_id) ON DELETE CASCADE,
        FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_product_name (product_name),
        INDEX idx_sku (product_sku),
        INDEX idx_category (category_id),
        INDEX idx_subcategory (subcategory_id),
        INDEX idx_brand (brand_id),
        INDEX idx_status (product_status)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_images (
        product_image_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        main_image MEDIUMBLOB NOT NULL,
        thumbnail_image1 MEDIUMBLOB NOT NULL,
        thumbnail_image2 MEDIUMBLOB NOT NULL,
        thumbnail_image3 MEDIUMBLOB NOT NULL,
        thumbnail_image4 MEDIUMBLOB NOT NULL,
        thumbnail_image5 MEDIUMBLOB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_suppliers (
        product_id INT NOT NULL,
        supplier_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (product_id, supplier_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
        INDEX idx_supplier_id (supplier_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS specifications (
        specification_id INT AUTO_INCREMENT PRIMARY KEY,
        specification_name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_spec_name (specification_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS category_specifications (
        category_spec_id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        specification_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY (category_id, specification_id),
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
        FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE,
        INDEX idx_category_id (category_id),
        INDEX idx_specification_id (specification_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_specifications (
        product_spec_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        specification_id INT NOT NULL,
        value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE,
        UNIQUE KEY (product_id, specification_id),
        INDEX idx_product_id (product_id),
        INDEX idx_specification_id (specification_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        tag_id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tag_name (tag_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_tags (
        product_tag_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
        UNIQUE KEY (product_id, tag_id),
        INDEX idx_product_id (product_id),
        INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Customer and order tables
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_customer_email (email),
        INDEX idx_active (active)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        customer_address_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        phone_number VARCHAR(20) NOT NULL,
        dial_code VARCHAR(10) NOT NULL,
        country VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        city VARCHAR(255) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        INDEX idx_customer_id (customer_id),
        INDEX idx_is_default (is_default)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        customer_id INT NOT NULL,
        rating INT CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        UNIQUE KEY (product_id, customer_id),
        INDEX idx_product_id (product_id),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        coupon_id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_value DECIMAL(10, 2),
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        times_used INT NOT NULL DEFAULT 0,
        max_usage INT DEFAULT NULL,
        order_amount_limit DECIMAL(10, 2) DEFAULT NULL,
        coupon_start_date TIMESTAMP NOT NULL,
        coupon_end_date TIMESTAMP NOT NULL,
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_code (code),
        INDEX idx_dates (coupon_start_date, coupon_end_date),
        CHECK (coupon_start_date <= coupon_end_date)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_coupons (
        product_coupon_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        coupon_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY (product_id, coupon_id),
        INDEX idx_product_id (product_id),
        INDEX idx_coupon_id (coupon_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_statuses (
        order_status_id INT AUTO_INCREMENT PRIMARY KEY,
        status_name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        privacy ENUM('public', 'private') NOT NULL DEFAULT 'private',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status_name (status_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
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
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
        FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE SET NULL,
        FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_customer_id (customer_id),
        INDEX idx_order_status (order_status_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        order_item_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        order_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Marketing tables
    await query(`
      CREATE TABLE IF NOT EXISTS carousels (
        carousel_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description VARCHAR(500),
        description VARCHAR(500),
        link VARCHAR(255),
        image MEDIUMBLOB NOT NULL,
        text_color VARCHAR(7) DEFAULT '#000000',
        background_color VARCHAR(7) DEFAULT '#FFFFFF',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_title (title),
        INDEX idx_status (status)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS usage_contexts (
        context_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS banners (
        banner_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        link VARCHAR(255),
        image MEDIUMBLOB NOT NULL,
        text_color VARCHAR(7) DEFAULT '#000000',
        background_color VARCHAR(7) DEFAULT '#FFFFFF',
        status ENUM('active', 'inactive') DEFAULT 'active',
        related_id INT DEFAULT NULL,
        usage_context_id INT NOT NULL,
        created_by INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (usage_context_id) REFERENCES usage_contexts(context_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_title (title),
        INDEX idx_related_id (related_id),
        INDEX idx_usage_context (usage_context_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}
