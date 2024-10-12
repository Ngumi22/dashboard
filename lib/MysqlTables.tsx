import { getConnection } from "./database";

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
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          INDEX idx_email (email),
          INDEX idx_role_name (role_name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Staff accounts and user information';

    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
          session_id INT AUTO_INCREMENT PRIMARY KEY,
          staff_id INT NOT NULL,
          session_token VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          FOREIGN KEY (staff_id) REFERENCES staff_accounts(staff_id) ON DELETE CASCADE,
          INDEX idx_session_token (session_token),
          INDEX idx_staff_id (staff_id)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Session management and tracking';
    `);

    await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_id INT NOT NULL,
        action_by INT NOT NULL,
        notification_type ENUM('add', 'update', 'delete') NOT NULL,
        entity_type ENUM('product', 'category', 'slide', 'tag', 'supplier', 'banner') NOT NULL,
        entity_id INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES staff_accounts(staff_id) ON DELETE CASCADE,
        FOREIGN KEY (action_by) REFERENCES staff_accounts(staff_id) ON DELETE CASCADE,
        INDEX idx_recipient_id (recipient_id),
        INDEX idx_action_by (action_by),
        INDEX idx_entity_id (entity_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Notifications for actions taken';
`);

    await connection.query(`
     CREATE TABLE IF NOT EXISTS categories (
          category_id INT AUTO_INCREMENT PRIMARY KEY,
          category_name VARCHAR(255) NOT NULL,
          category_image MEDIUMBLOB NOT NULL,
          category_description TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product categories';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS brands (
            brand_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            brandImage MEDIUMBLOB NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL,
            created_by INT DEFAULT NULL,
            updated_by INT DEFAULT NULL,
            FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
            FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
            INDEX idx_name (name)
        ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product brands';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          supplier_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone_number VARCHAR(255) NOT NULL,
          location TEXT NOT NULL,
          created_at TIMESTAMP NULL DEFAULT NULL,
          updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id) ON DELETE SET NULL,
          INDEX idx_name (name)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Suppliers and their contact information';
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          product_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          sku VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          discount DECIMAL(10, 2) DEFAULT 0.00,
          quantity INT DEFAULT 0,
          status ENUM('draft', 'pending', 'approved') DEFAULT 'draft',
          category_id INT NOT NULL,
          brand_id INT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(category_id),
          FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_name (name),
          INDEX idx_sku (sku),
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
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
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
          name VARCHAR(255) NOT NULL UNIQUE, -- Name of the specification (e.g., "RAM")
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
          -- Index for faster querying based on product-specification pairs
          INDEX idx_product_specification (product_id, specification_id),
          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
          FOREIGN KEY (specification_id) REFERENCES specifications(specification_id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
          tag_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_name (name)
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

    // Create the variant_types table with an additional variant type for height
    await connection.query(`
    CREATE TABLE IF NOT EXISTS variant_types (
        variant_type_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
        INDEX idx_name (name)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Types of variants for products';
  `);

    // Create the variants table to hold each product variant
    await connection.query(`
    CREATE TABLE IF NOT EXISTS variants (
        variant_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variant_type_id INT NOT NULL,
        value VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0.00,
        quantity INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (variant_type_id) REFERENCES variant_types(variant_type_id),
        FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
        INDEX idx_product_id (product_id),
        INDEX idx_variant_type_id (variant_type_id)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Product variants';
  `);

    // Create the variant_attributes table to hold attributes for each variant
    await connection.query(`
    CREATE TABLE IF NOT EXISTS variant_attributes (
        variant_attribute_id INT AUTO_INCREMENT PRIMARY KEY,
        variant_id INT NOT NULL,
        attribute_name VARCHAR(255) NOT NULL,
        attribute_value VARCHAR(255),
        FOREIGN KEY (variant_id) REFERENCES variants(variant_id) ON DELETE CASCADE
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Attributes for each variant';
  `);

    // Create the product_variant_images table to hold images for variants
    await connection.query(`
    CREATE TABLE IF NOT EXISTS product_variant_images (
        product_variant_image_id INT AUTO_INCREMENT PRIMARY KEY,
        variant_id INT NOT NULL,
        variant_image MEDIUMBLOB,
        variant_thumbnail1 MEDIUMBLOB,
        variant_thumbnail2 MEDIUMBLOB,
        variant_thumbnail3 MEDIUMBLOB,
        variant_thumbnail4 MEDIUMBLOB,
        variant_thumbnail5 MEDIUMBLOB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        FOREIGN KEY (variant_id) REFERENCES variants(variant_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
        FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id)
    ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Images associated with product variants';
`);

    // Customer-related tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
          customer_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          INDEX idx_email (email)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer accounts';
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
          customer_address_id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT NOT NULL,
          address_line1 TEXT NOT NULL,
          address_line2 TEXT,
          phone_number VARCHAR(255) NOT NULL,
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
        short_description VARCHAR(500) DEFAULT NULL COMMENT 'Short description of the product or slide',
        button_text VARCHAR(100) DEFAULT NULL COMMENT 'Text displayed on the button',
        button_link VARCHAR(255) DEFAULT NULL COMMENT 'Link that the button leads to',
        image BLOB DEFAULT NULL COMMENT 'Image for the carousel slide',
        position INT NOT NULL DEFAULT 1 COMMENT 'Position of the slide in the carousel (1-4)',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Status of the carousel slide',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        created_by INT,
        updated_by INT,
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
          image BLOB DEFAULT NULL COMMENT 'Image for the banner',
          text_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Text color in hex format (default is black)',
          background_color VARCHAR(7) DEFAULT '#FFFFFF' COMMENT 'Background color in hex format (default is white)',
          status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Status of the banner',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          created_by INT DEFAULT NULL,
          updated_by INT DEFAULT NULL,
          FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id),
          FOREIGN KEY (updated_by) REFERENCES staff_accounts(staff_id),
          INDEX idx_title (title)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Banners for various sections of the site';
    `);

    await connection.commit();
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
    await connection.rollback();
  } finally {
    await connection.release();
  }
}

export async function CreateTriggers() {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`
      CREATE PROCEDURE update_at_timestamp()
      BEGIN
          SET NEW.updated_at = NOW();
      END;
    `);
    await connection.query(`
      CREATE TRIGGER category_set_update BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER attribute_set_update BEFORE UPDATE ON attributes FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER product_set_update BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER staff_set_update BEFORE UPDATE ON staff_accounts FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER coupon_set_update BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER customer_set_update BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER order_set_update BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER notification_set_update BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER tag_set_update BEFORE UPDATE ON tags FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER order_status_set_update BEFORE UPDATE ON order_statuses FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
      CREATE TRIGGER supplier_set_update BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();
    `);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release();
  }
}
