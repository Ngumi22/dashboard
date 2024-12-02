"use client";

import HeroSection from "./Hero/hero";

export default function Page() {
  return (
    <div className="mt-[12rem] md:mt-[14rem]">
      <HeroSection />
      <HeroSection />

      {/* <div>
        {products.map((product: any) => (
          <div key={product.id}>
            <p>{product.name}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
}
