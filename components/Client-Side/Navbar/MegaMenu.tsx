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
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { SelectSeparator } from "@/components/ui/select";

interface MegaMenuProps {
  navigation: NavigationItem[];
}

export default function MegaMenu({ navigation }: MegaMenuProps) {
  return (
    <NavigationMenu className="container hidden md:block mx-auto w-full">
      <NavigationMenuList className="w-full">
        {navigation.map((item) => (
          <NavigationMenuItem key={item.title} className="">
            {item.items ? (
              <>
                <NavigationMenuTrigger className="h-12">
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex items-center justify-start gap-4 w-[100vw] bg-white shadow-lg px-4 py-6 h-fit">
                    <div className="flex flex-col items-start w-1/5 bg-gray-100 h-full"></div>
                    <SelectSeparator />

                    <div className="pr-8 w-4/5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-gray-700">
                          Categories
                        </p>
                        <Link
                          href={"#"}
                          className="text-sm text-gray-900 hover:underline">
                          See all
                        </Link>
                      </div>
                      <div className="flex flex-nowrap md:flex-wrap items-center justify-start gap-x-4">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className="group block aspect-square space-y-5">
                            <Image
                              src={subItem.imageUrl || "/placeholder.svg"}
                              alt={subItem.title}
                              width={100}
                              height={100}
                              className="w-40 h-full object-cover rounded-md"
                            />
                            <h3 className="text-sm font-medium text-gray-900">
                              {subItem.title}
                            </h3>
                          </Link>
                        ))}
                      </div>
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
