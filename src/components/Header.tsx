'use client';

import Link from 'next/link';
import { BookOpen, Home, Image as ImageIcon, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import { useCart } from '@/hooks/useCart'; // Import useCart hook

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/gallery', label: 'Gallery', icon: BookOpen },
  { href: '/customize', label: 'Customize', icon: ImageIcon },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth(); // Get user and logout function
  const { cartCount } = useCart(); // Get cart count

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
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
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart Icon */}
          <Link href="/cart" passHref legacyBehavior>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive" // Or use 'default' with primary color
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth Buttons */}
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                   {/* Optional: Display user name/icon */}
                   {/* <span className="hidden sm:inline text-sm text-muted-foreground">Hi, {user.name}</span> */}
                   <Button variant="outline" size="sm" onClick={logout}>
                     <LogOut className="h-4 w-4 mr-1" /> Logout
                   </Button>
                </div>
              ) : (
                 <div className="flex items-center gap-2">
                    <Link href="/login" passHref legacyBehavior>
                        <Button variant="outline" size="sm">
                            <LogIn className="h-4 w-4 mr-1" /> Login
                        </Button>
                    </Link>
                    <Link href="/register" passHref legacyBehavior>
                        <Button size="sm" className="hidden sm:inline-flex">Sign Up</Button>
                    </Link>
                 </div>
              )}
            </>
          )}
           {/* Mobile Menu Button (Placeholder) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>
      {/* Add Mobile Menu Component Here Later */}
    </header>
  );
}
