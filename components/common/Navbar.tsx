"use client";

import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-light.png"
            alt="Sharon's Kitchen Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-bold text-lg">Sharon&apos;s Kitchen</span>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

