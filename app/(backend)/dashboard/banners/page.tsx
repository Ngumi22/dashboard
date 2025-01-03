"use client";

import BannerForm from "./banner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BannerComponent from "@/components/Client-Side/Hero/banners";

export default function Bannerspage() {
  return (
    <section className="m-4 grid justify-items-stretch space-y-8">
      <div>
        <BannerComponent isAdmin />
      </div>
    </section>
  );
}
