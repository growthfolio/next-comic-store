
'use client';

import Link from 'next/link';
import { BookOpen, Home, Image as ImageIcon, ShoppingCart, User, LogIn, LogOut, Package } from 'lucide-react'; // Added Package icon
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Import Badge
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
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

  // Helper function to get initials
  const getInitials = (name: string) => {
     return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

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
           {/* My Orders Link - Show only if logged in */}
           {user && (
              <Link
                href="/profile/orders"
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === '/profile/orders' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                My Orders
              </Link>
            )}
        </nav>
        <div className="flex items-center gap-2 md:gap-4 ml-auto"> {/* Added ml-auto */}
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

          {/* Auth Section */}
          {!isLoading && (
            <>
              {user ? (
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-8 w-8">
                          {/* Placeholder for user image if available */}
                          {/* <AvatarImage src="/avatars/01.png" alt={user.name} /> */}
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                       </Avatar>
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                       <div className="flex flex-col space-y-1">
                         <p className="text-sm font-medium leading-none">{user.name}</p>
                         <p className="text-xs leading-none text-muted-foreground">
                           {user.email}
                         </p>
                       </div>
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                         <Link href="/profile/orders" className="cursor-pointer">
                            <Package className="mr-2 h-4 w-4" />
                            <span>My Orders</span>
                         </Link>
                      </DropdownMenuItem>
                       {/* Add more profile/settings links here if needed */}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                       <LogOut className="mr-2 h-4 w-4" />
                       <span>Log out</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>

              ) : (
                 <div className="flex items-center gap-2">
                    <Link href="/login" passHref legacyBehavior>
                        <Button variant="outline" size="sm">
                            <LogIn className="h-4 w-4 mr-1" /> Login
                        </Button>
                    </Link>
                    <Link href="/register" passHref legacyBehavior>
                        <Button size="sm" className="hidden sm:inline-flex bg-accent hover:bg-accent/90">Sign Up</Button>
                    </Link>
                 </div>
              )}
            </>
          )}
           {/* Mobile Menu Button (Placeholder/Optional) */}
           {/* Consider adding a Sheet component here for mobile navigation */}
          {/* <Button variant="ghost" size="icon" className="md:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
             <span className="sr-only">Toggle Menu</span>
           </Button> */}
        </div>
      </div>
    </header>
  );
}
