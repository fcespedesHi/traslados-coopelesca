import React from "react";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import logo from "@/public/logo.png"
import Image from "next/image";
function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto ">
      <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-4 justify-center mx-auto">
          
          <div className="text-xl font-bold text-blue-700">
            <Image src={logo} alt="logo" width={138} height={138} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              RC
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Header;
