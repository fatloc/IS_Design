import React from "react";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex w-full max-w-sm items-center gap-2">
        <Search className="text-gray-400" size={20} />
        <Input
          type="search"
          placeholder="Tìm kiếm..."
          className="h-9 border-none bg-gray-100 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User size={16} />
          </div>
          <span className="hidden text-sm font-medium text-gray-700 md:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
