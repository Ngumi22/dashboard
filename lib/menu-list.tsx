import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  UsersRound,
  Book,
  ShoppingCart,
  BookOpen,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Home",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/dashboard/products",
          label: "Products",
          active: pathname.includes("/dashboard/products"),
          icon: SquarePen,
          submenus: [],
        },
        {
          href: "/dashboard/categories",
          label: "Categories",
          active: pathname.includes("/categories"),
          icon: Bookmark,
          submenus: [],
        },
        {
          href: "/dashboard/banners",
          label: "Banners",
          active: pathname.includes("/banners"),
          icon: Bookmark,
          submenus: [],
        },
        {
          href: "/dashboard/orders",
          label: "Orders",
          active: pathname.includes("/orders"),
          icon: ShoppingCart,
          submenus: [],
        },
        {
          href: "/dashboard/invoices",
          label: "Invoices",
          active: pathname.includes("/invoices"),
          icon: BookOpen,
          submenus: [],
        },
        {
          href: "/dashboard/customers",
          label: "Customers",
          active: pathname.includes("/customers"),
          icon: UsersRound,
          submenus: [],
        },

        {
          href: "/dashboard/products",
          label: "Product",
          active: pathname.includes("products"),
          icon: Book,
          submenus: [
            {
              href: "/dashboard/products",
              label: "All Products",
              active: pathname === "/dashboard/products",
            },
            {
              href: "/dashboard/categories",
              label: "Categories",
              active: pathname === "/dashboard/categories",
            },
            {
              href: "/dashboard/brands",
              label: "Brands",
              active: pathname === "/dashboard/brands",
            },
            {
              href: "/dashboard/suppliers",
              label: "Suppliers",
              active: pathname === "/dashboard/suppliers",
            },
          ],
        },

        {
          href: "/dashboard/blog",
          label: "Blog",
          active: pathname.includes("/dashboard/blog"),
          icon: Book,
          submenus: [
            {
              href: "/dashboard/blog/posts",
              label: "All Posts",
              active: pathname === "/dashboard/blog/posts",
            },
            {
              href: "/dashboard/blog/posts/new",
              label: "New Post",
              active: pathname === "/dashboard/blog/posts/new",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          active: pathname.includes("/users"),
          icon: Users,
          submenus: [],
        },
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}
