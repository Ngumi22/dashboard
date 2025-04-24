import { Phone, MessageCircleHeart } from "lucide-react";

export default function TopNav() {
  return (
    <div className="flex items-center justify-between px-2 sm:px-4 py-1">
      {/* Left Section: Delivery Text */}
      <p className="text-xs md:text-sm whitespace-nowrap truncate">
        Free Deliveries
      </p>

      {/* Right Section: Contact Links and Account Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Phone Link */}
        <a
          href="tel:+254 112 725 364"
          className="hover:text-gray-300 flex items-center gap-1 sm:gap-2 px-2 h-8">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline text-xs md:text-sm whitespace-nowrap">
            +254 (0) 112 725 364
          </span>
        </a>

        {/* WhatsApp Link */}
        <a
          href="https://wa.me/+254 112 725 364"
          className="hover:text-gray-300 flex items-center gap-1 sm:gap-2 px-2 h-8">
          <MessageCircleHeart className="h-4 w-4" />
          <span className="hidden sm:inline text-xs md:text-sm whitespace-nowrap">
            WhatsApp
          </span>
        </a>

        {/* Account Dropdown */}
      </div>
    </div>
  );
}
