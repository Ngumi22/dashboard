import Image from "next/image";
import Link from "next/link";

export default function NeckbandBanner() {
  return (
    <div className="relative max-w-5xl aspect-[16/9] bg-gradient-to-tr from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl w-full">
      {/* Background gradient spotlight effect */}
      <div className="absolute top-1/4 right-1/4  bg-white/10 rounded-full blur-3xl"></div>

      {/* Product image positioned behind text */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2/3 h-full flex items-center justify-center z-0">
        <Image
          src="/placeholder.jpg"
          alt="Neckband Wireless Earphones"
          width={500}
          height={300}
          className="object-contain scale-75 md:scale-100 h-44"
        />
      </div>

      {/* Content container */}
      <div className="relative h-full p-8 md:p-12 z-10">
        {/* Left side text content */}
        <div className="flex flex-col justify-center w-full md:w-1/2">
          <h2 className="text-sky-300 text-xl md:text-2xl font-medium mb-1">
            NeckBand Wireless
          </h2>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Earphone
            <span className="border-b-4 border-white pb-1 pr-12"></span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-md mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna. Quis ipsum
            suspendisse ultrices gravida.
          </p>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Link
              href="#"
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-md transition-colors">
              Buy Now
            </Link>
          </div>
        </div>

        {/* SH1 text overlay */}
        <div className="absolute top-8 right-12 z-20">
          <h1 className="text-white text-6xl md:text-8xl font-bold opacity-90">
            SH1
          </h1>
        </div>

        {/* Vertical NECKBAND text */}
        <div className="absolute right-0 bottom-0 bg-red-600 text-white py-6 px-2 flex items-center z-20">
          <span className="transform rotate-90 origin-center font-bold tracking-wider text-xs whitespace-nowrap">
            NECKBAND
          </span>
        </div>
      </div>
    </div>
  );
}
