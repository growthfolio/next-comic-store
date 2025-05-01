'use client';

import Link from 'next/link';
import { BookOpen, Home, Image as ImageIcon, ShoppingCart, User } from 'lucide-react'; // Using ImageIcon for Customize
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/gallery', label: 'Gallery', icon: BookOpen },
  { href: '/customize', label: 'Customize', icon: ImageIcon },
  // { href: '/cart', label: 'Cart', icon: ShoppingCart }, // Future cart page
  { href: '/checkout', label: 'Checkout', icon: ShoppingCart }, // Temporary link to checkout
  // { href: '/profile', label: 'Profile', icon: User }, // Future profile page
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
          {/* Replace with a proper logo if available */}
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ComicHub</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
           {/* Add Auth buttons later */}
           {/* <Button variant="outline" size="sm">Login</Button>
           <Button size="sm">Sign Up</Button> */}
            <Button variant="ghost" size="icon" className="md:hidden">
              {/* Placeholder for mobile menu trigger */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              <span className="sr-only">Toggle Menu</span>
            </Button>
        </div>
      </div>
       {/* Add Mobile Menu Component Here Later */}
    </header>
  );
}
