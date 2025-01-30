"use client";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { NavigationItem } from "@/lib/definitions";

interface MegaMenuProps {
  navigation: NavigationItem[];
}

export default function MegaMenu({ navigation }: MegaMenuProps) {
  return (
    <NavigationMenu className="hidden md:block w-full">
      <NavigationMenuList className="flex-wrap gap-2">
        {navigation.map((item) => (
          <NavigationMenuItem key={item.title} className="w-full sm:w-auto">
            {item.items ? (
              <>
                <NavigationMenuTrigger className="h-10 px-3 text-sm w-full justify-start sm:w-auto sm:justify-center">
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-screen bg-white shadow-lg">
                    <div className="container mx-auto grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
                      {item.items.map((section) => (
                        <div key={section.title} className="space-y-4">
                          {section.featured && (
                            <div className="grid gap-4 md:grid-cols-2">
                              {section.featured.map((featured) => (
                                <Link
                                  key={featured.title}
                                  href={featured.href}
                                  className="group block space-y-2 rounded-lg bg-gray-100 p-4 hover:bg-gray-200">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {featured.title}
                                    </h3>
                                    {featured.description && (
                                      <p className="text-sm text-gray-500">
                                        {featured.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                          {section.categories && (
                            <div className="grid gap-4 md:grid-cols-2">
                              {section.categories.map((category) => (
                                <div key={category.title}>
                                  <h4 className="mb-3 text-sm font-semibold text-gray-900">
                                    {category.title}
                                  </h4>
                                  <ul className="space-y-2">
                                    {category.items.map((item) => (
                                      <li key={item.title}>
                                        <Link
                                          href={item.href}
                                          className="text-sm text-gray-600 hover:text-gray-900">
                                          {item.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {item.title}
                </NavigationMenuLink>
              </Link>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
