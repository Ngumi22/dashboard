import { query } from "./initDb";

export async function dbsetupTables() {
  try {
    // Create the database if it doesn't exist
    await query(`CREATE DATABASE IF NOT EXISTS bernzz`);

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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS allowed_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(id)
      );
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
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
    await query(`
     CREATE TABLE IF NOT EXISTS auth_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        success BOOLEAN DEFAULT FALSE,
        ip VARCHAR(45),
        user_agent TEXT,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
     CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip VARCHAR(45) NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email, ip, attempt_time)
      );
    `);

    // Create the tables
    await query(`
      CREATE TABLE IF NOT EXISTS staff_accounts (
          staff_id INT AUTO_INCREMENT PRIMARY KEY,
          role ENUM('super_admin', 'admin', 'user', 'manager') NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(20),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          image MEDIUMBLOB,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          INDEX idx_email (email),
          INDEX idx_role (role)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Staff accounts and user information';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
          session_id INT AUTO_INCREMENT PRIMARY KEY,
          staff_id INT NOT NULL,
          session_token VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (staff_id) REFERENCES staff_accounts(staff_id) ON DELETE CASCADE,
          INDEX idx_sessions_staff_id (staff_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COMMENT='Session tokens for user authentication';
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS brands (
            brand_id INT AUTO_INCREMENT PRIMARY KEY,
            brand_name VARCHAR(255) NOT NULL,
            brand_image MEDIUMBLOB NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL,
            INDEX idx_name (brand_name)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product brands';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
          category_id INT AUTO_INCREMENT PRIMARY KEY,
          category_name VARCHAR(255) NOT NULL,
          category_image MEDIUMBLOB NOT NULL,
          category_description VARCHAR(255) NOT NULL,
          category_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
          parent_category_id INT NULL, -- Reference to parent category
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
          INDEX idx_category_name (category_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product categories';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          supplier_id INT AUTO_INCREMENT PRIMARY KEY,
          supplier_name VARCHAR(255) NOT NULL,
          supplier_email VARCHAR(255) NOT NULL UNIQUE,
          supplier_phone_number VARCHAR(255) NOT NULL,
          supplier_location TEXT NOT NULL,
          created_at TIMESTAMP NULL DEFAULT NULL,
          updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          INDEX idx_name (supplier_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Suppliers and their contact information';
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
          category_id INT NOT NULL, -- Product must belong to a category
          subcategory_id INT NULL, -- Product can optionally belong to a subcategory
          brand_id INT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (subcategory_id) REFERENCES categories(category_id) ON DELETE SET NULL ON UPDATE CASCADE,
          FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL ON UPDATE CASCADE,
          INDEX idx_name (product_name),
          INDEX idx_sku (product_sku),
          INDEX idx_category_id (category_id),
          INDEX idx_subcategory_id (subcategory_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Products data';
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
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product images and thumbnails';
      `);

    await query(`
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

    await query(`
      CREATE TABLE IF NOT EXISTS specifications (
          specification_id INT AUTO_INCREMENT PRIMARY KEY,
          specification_name VARCHAR(255) NOT NULL UNIQUE, -- Name of the specification (e.g., "RAM")
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS category_specifications (
          category_spec_id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT NOT NULL,
          specification_id INT NOT NULL,
          UNIQUE KEY (category_id, specification_id),
          FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await query(`
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

    await query(`
      CREATE TABLE IF NOT EXISTS tags (
          tag_id INT AUTO_INCREMENT PRIMARY KEY,
          tag_name VARCHAR(255) NOT NULL,
          INDEX idx_name (tag_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tags for products';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_tags (
          product_tag_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          tag_id INT NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(tag_id),
          INDEX idx_product_id (product_id),
          INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product tags relationship';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS variant_values (
          variant_value_id INT AUTO_INCREMENT PRIMARY KEY,
          specification_id INT NOT NULL,
          value VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE,
          UNIQUE KEY unique_variant_value (specification_id, value)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores valid values for product-specific specifications';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS variants (
          variant_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          variant_price DECIMAL(10,2) DEFAULT 0.00,
          variant_quantity INT DEFAULT 0,
          variant_status ENUM('active', 'inactive') DEFAULT 'active',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores unique product variants based on product specifications';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS variant_combinations (
          variant_combination_id INT AUTO_INCREMENT PRIMARY KEY,
          variant_id INT NOT NULL,
          specification_id INT NOT NULL,
          variant_value_id INT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (variant_id) REFERENCES variants(variant_id) ON DELETE CASCADE,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE,
          FOREIGN KEY (variant_value_id) REFERENCES variant_values(variant_value_id) ON DELETE CASCADE,
          UNIQUE KEY unique_variant_combination (variant_id, specification_id, variant_value_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Links product variants to their allowed specifications and values';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS variant_images (
          variant_image_id INT AUTO_INCREMENT PRIMARY KEY,
          variant_id INT NOT NULL,
          image_data MEDIUMBLOB NOT NULL,
          image_type ENUM('full', 'thumbnail') DEFAULT 'full',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (variant_id) REFERENCES variants(variant_id) ON DELETE CASCADE,
          INDEX idx_variant_id (variant_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Images for product variants stored as BLOBs';
    `);

    // Customer-related tables
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
          customer_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_first_name VARCHAR(100) NOT NULL,
          customer_last_name VARCHAR(100) NOT NULL,
          customer_email VARCHAR(255) NOT NULL UNIQUE,
          customer_password_hash VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          INDEX idx_customer_email (customer_email)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer accounts';
    `);

    await query(`
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
          FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
          INDEX idx_customer_id (customer_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer addresses';
    `);

    // Reviews Table
    await query(`
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

    await query(`
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
          INDEX idx_code (code),
          CHECK (coupon_start_date <= coupon_end_date)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Coupon details and usage';
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
            updated_by INT,
            FOREIGN KEY (product_id) REFERENCES products(product_id),
            FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
            INDEX idx_product_id (product_id),
            INDEX idx_coupon_id (coupon_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Relation between products and coupons';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_statuses (
          order_status_id INT AUTO_INCREMENT PRIMARY KEY,
          status_name VARCHAR(255) NOT NULL,
          color VARCHAR(50) NOT NULL,
          privacy ENUM('public', 'private') NOT NULL DEFAULT 'private',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          INDEX idx_status_name (status_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Order status metadata';
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
          FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
          FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
          FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id),
          INDEX idx_customer_id (customer_id),
          INDEX idx_coupon_id (coupon_id),
          INDEX idx_order_status_id (order_status_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Order details and statuses';
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
          deleted_at TIMESTAMP NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id),
          FOREIGN KEY (order_id) REFERENCES orders(order_id),
          INDEX idx_product_id (product_id),
          INDEX idx_order_id (order_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Items in an order';
    `);

    await query(`
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
        INDEX idx_title (title)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Hero section carousel slides';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS banners (
        banner_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT 'Title for the banner',
        description VARCHAR(500) DEFAULT NULL COMMENT 'Small description for the banner',
        link VARCHAR(255) DEFAULT NULL COMMENT 'Link the banner will lead to when clicked',
        image MEDIUMBLOB DEFAULT NULL COMMENT 'Image for the banner',
        text_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Text color in hex format (default is black)',
        background_color VARCHAR(7) DEFAULT '#FFFFFF' COMMENT 'Background color in hex format (default is white)',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Status of the banner',
        related_id INT DEFAULT NULL COMMENT 'ID of the related entity (e.g., product ID, category ID, or brand ID)',
        usage_context_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_title (title),
        INDEX idx_related_id (related_id)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Banners for various sections of the site';
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS usage_contexts (
          context_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique name for the usage context',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='List of usage contexts for banners';
    `);
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}
