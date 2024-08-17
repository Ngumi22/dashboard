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
          href: "/dashboard/customers",
          label: "Customers",
          active: pathname.includes("/customers"),
          icon: UsersRound,
          submenus: [],
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
