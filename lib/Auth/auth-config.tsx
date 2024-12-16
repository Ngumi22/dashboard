type Role = "super-admin" | "admin" | "user";

type Action = "view" | "create" | "update" | "delete";

type Entity =
  | "products"
  | "categories"
  | "brands"
  | "users"
  | "suppliers"
  | "carousel"
  | "banners"
  | "reviews"
  | "blog"
  | "customers"
  | "orders"
  | "coupons"
  | "productVariants";

type User = {
  id: string;
  roles: Role[];
  blockedBy: string[];
};

type PermissionCheck<E extends Entity> =
  | boolean
  | ((user: User, entity?: E) => boolean);

type RolePermissions = {
  [R in Role]?: Partial<
    Record<Entity, Partial<Record<Action, PermissionCheck<Entity>>>>
  >;
};

const ROLES: RolePermissions = {
  "super-admin": {
    products: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    categories: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    brands: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    users: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    suppliers: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    carousel: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    banners: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    reviews: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    blog: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    customers: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    orders: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    coupons: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    productVariants: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  admin: {
    products: {
      view: true,
      create: true,
      update: true,
      delete: false,
    },
    categories: {
      view: true,
      create: true,
      update: true,
      delete: false,
    },
    brands: {
      view: true,
      create: true,
      update: true,
      delete: false,
    },
    users: {
      view: true,
      update: true,
    },
    suppliers: {
      view: true,
      create: true,
      update: true,
    },
    orders: {
      view: true,
      update: true,
    },
    reviews: {
      view: true,
      update: (user) => !user.blockedBy.includes(user.id),
    },
  },
  user: {
    products: {
      view: true,
    },
    categories: {
      view: true,
    },
    reviews: {
      view: true,
      create: true,
      update: (user) => !user.blockedBy.includes(user.id),
    },
    orders: {
      view: true,
      create: true,
    },
  },
};

function hasPermission<E extends Entity>(
  user: User,
  entity: E,
  action: Action,
  debug = false
): boolean | { allowed: boolean; reason: string } {
  for (const role of user.roles) {
    const rolePermissions = ROLES[role]?.[entity]?.[action];
    if (rolePermissions === undefined) continue;

    if (typeof rolePermissions === "boolean") {
      return debug
        ? {
            allowed: rolePermissions,
            reason: rolePermissions
              ? "Allowed by configuration."
              : "Denied by configuration.",
          }
        : rolePermissions;
    }

    if (typeof rolePermissions === "function") {
      const allowed = rolePermissions(user, entity);
      return debug
        ? {
            allowed,
            reason: allowed
              ? "Allowed by function evaluation."
              : "Denied by function evaluation.",
          }
        : allowed;
    }
  }

  return debug
    ? { allowed: false, reason: "No matching permissions found." }
    : false;
}
