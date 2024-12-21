export const DBQUERYLIMITS = {
  brand: 5,
  category: 5,
  default: 10,
};

export const entities = [
  "products",
  "categories",
  "users",
  "reviews",
  "orders",
  "carousel",
  "banners",
  "brands",
  "suppliers",
  "variants",
];

export const roles = ["admin", "super-admin", "user"];

export const actions = ["delete", "view"];

export const users = [
  {
    first_name: "Super",
    last_name: "Admin",
    phone_number: "1234567890",
    email: "superadmin@example.com",
    password: "superadmin123",
    role_name: "super-admin",
  },
  // Add other users here
];

export const permissions = [
  // Admin permissions
  {
    role_name: "admin",
    entity_name: "products",
    action_name: "delete",
    has_permission: true,
  },
  {
    role_name: "admin",
    entity_name: "products",
    action_name: "view",
    has_permission: true,
  },
  // Super Admin permissions
  {
    role_name: "super-admin",
    entity_name: "products",
    action_name: "delete",
    has_permission: true,
  },
  {
    role_name: "super-admin",
    entity_name: "products",
    action_name: "view",
    has_permission: true,
  },
  // User permissions
  {
    role_name: "user",
    entity_name: "products",
    action_name: "delete",
    has_permission: true,
  },
  {
    role_name: "user",
    entity_name: "products",
    action_name: "view",
    has_permission: true,
  },
];
