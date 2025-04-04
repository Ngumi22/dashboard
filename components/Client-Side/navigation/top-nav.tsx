import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Wishlist from "./wishlist";
import Compare from "./compare";
import User from "./user";

export default function TopNav() {
  return (
    <div className="bg-white text-black h-18 py-1 grid md:grid-flow-col place-content-between w-full m-auto content-center px-6">
      <p className="grid grid-cols-2 place-content-between content-center my-auto gap-2 text-sm">
        <span className="font-medium my-auto text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-tag">
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
        </span>
        Get upto 25% Cashback on first Order:
        <span className="font-semibold text-sm ml-0">GET25OFF</span>
      </p>
      <div className="grid grid-flow-col place-content-between content-center gap-x-8">
        <Select>
          <SelectTrigger className="w-[6rem] bg-inherit border-none">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent className="grid grid-flow-row gap-4">
            <User />
            <Compare />
            <Wishlist />
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[6.8rem] bg-inherit border-none">
            <SelectValue placeholder="My Account" />
          </SelectTrigger>
          <SelectContent className="grid grid-flow-row gap-4">
            <User />
            <Compare />
            <Wishlist />
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
