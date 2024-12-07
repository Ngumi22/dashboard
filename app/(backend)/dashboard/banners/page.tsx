"use client";

import { Card, CardContent } from "@/components/ui/card";
import BannerForm from "./banner";
import { CarouselForm } from "./carousel";

export default function Bannerspage() {
  return (
    <section className="p-2">
      <BannerForm />
      <>
        <CarouselForm />
      </>
    </section>
  );
}
