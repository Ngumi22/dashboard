type Role = "super-admin" | "admin" | "manager" | "user";

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((
      user: User,
      data: Permissions[Key]["dataType"],
      context?: AuthContext
    ) => boolean);

// Context for dynamic checks (e.g., current app state, user role details)
type AuthContext = {
  currentRole: Role;
  userRoles: Role[];
  // Extendable for additional metadata
  [key: string]: any;
};

type RolesWithPermissions = {
  [R in Role]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
    }>;
  }>;
};

// Permissions for various resources
type Permissions = {
  products: {
    dataType: Product;
    action: "view" | "create" | "update" | "delete";
  };
  orders: { dataType: Order; action: "view" | "update" | "cancel" | "refund" };
  users: {
    dataType: User;
    action: "view" | "block" | "unblock" | "create" | "update" | "delete";
  };
  categories: {
    dataType: Category;
    action: "view" | "create" | "update" | "delete";
  };
  brands: { dataType: Brand; action: "view" | "create" | "update" | "delete" };
};

type Product = { id: string; name: string; ownerId: string; createdAt: Date };
type Order = { id: string; userId: string; status: string; createdAt: Date };
type User = { blockedBy: string[]; roles: Role[]; id: string };
type Category = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
};
type Brand = { id: string; name: string; createdBy: string; createdAt: Date };

// Role and permission configuration
const ROLES = {
  "super-admin": {
    products: { view: true, create: true, update: true, delete: true },
    orders: { view: true, update: true, cancel: true, refund: true },
    users: { view: true, block: true, unblock: true, update: true },
    categories: { view: true, create: true, update: true, delete: true },
    brands: { view: true, create: true, update: true, delete: true },
  },
  admin: {
    products: {
      view: true,
      create: true,
      update: (user, product) => product.ownerId === user.id,
      delete: false,
    },
    orders: { view: true, update: true, cancel: true, refund: false },
    users: { view: true, block: false, unblock: false, update: false },
    categories: { view: true, create: true, update: true, delete: true },
    brands: { view: true, create: true, update: true, delete: true },
  },
  manager: {
    products: { view: true, create: true, update: true, delete: false },
    orders: { view: true, update: true, cancel: false, refund: false },
    categories: { view: true, create: false, update: true, delete: false },
    brands: { view: true, create: false, update: true, delete: false },
  },
  user: {
    products: { view: true, create: false, update: false, delete: false },
    orders: {
      view: (user, order) => order.userId === user.id,
      cancel: false,
      refund: false,
    },
    users: {},
    categories: { view: true },
    brands: { view: true },
  },
} as const satisfies RolesWithPermissions;

// Permission Check Function
export function hasPermission<Resource extends keyof Permissions>(
  user: User,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"],
  context?: AuthContext
) {
  return user.roles.some((role) => {
    const permission = (ROLES[role] as RolesWithPermissions[Role])[resource]?.[
      action
    ];
    if (permission == null) return false;

    if (typeof permission === "boolean") return permission;
    return data != null && permission(user, data, context);
  });
}

// Example Usage
const user: User = { blockedBy: ["2"], id: "1", roles: ["admin"] };
const product: Product = {
  id: "3",
  name: "Test Product",
  ownerId: "1",
  createdAt: new Date(),
};

// Check if user can update the product
const canUpdateProduct = hasPermission(user, "products", "update", product);
console.log({ canUpdateProduct }); // true or false
