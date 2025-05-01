'use client';

import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getComics, type Comic } from '@/services/comic-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

function HomePageContent() {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addItem } = useCart();

  // Fetch comics from the API (using Prisma backend)
  const { data: comics, isLoading: isComicsLoading, error } = useQuery<Comic[], Error>({
    queryKey: ['comics'],
    queryFn: getComics,
    staleTime: 1000 * 60 * 5,
  });

  const handleAddToCart = (comic: Comic) => {
     addItem({
        id: comic.id, // Use numeric ID from Prisma
        title: comic.title,
        price: comic.price,
        quantity: 1,
        imageUrl: comic.imageUrl || `https://picsum.photos/seed/${comic.id}/100/150`,
        isCustom: false,
     });
  };


  if (isComicsLoading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
         {isAuthLoading && <Skeleton className="h-8 w-48 mb-4 mx-auto" />}
        <h1 className="text-3xl font-bold mb-8 text-center">Featured Comics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-lg rounded-lg">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-4" />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching comics:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        Failed to load comics. Please try refreshing the page. ({error.message})
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {user && (
          <div className="mb-8 p-4 bg-accent/10 border border-accent rounded-lg text-center flex items-center justify-center gap-2">
             {user.isAdmin && <ShieldCheck className="h-5 w-5 text-primary" />}
            <p className="text-lg font-medium text-accent-foreground">
                {user.isAdmin ? `Welcome back, Admin ${user.name}!` : `Welcome back, ${user.name}!`}
            </p>
          </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-center">Featured Comics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {comics && comics.length > 0 ? (
            comics.slice(0, 4).map((comic, index) => (
              <Card key={comic.id} className="overflow-hidden shadow-lg rounded-lg flex flex-col">
                <div className="relative w-full h-60">
                  <Image
                    src={comic.imageUrl || `https://picsum.photos/seed/${comic.id}/400/600`}
                    alt={comic.title}
                    fill
                    style={{objectFit: 'cover'}}
                    className="rounded-t-lg"
                    data-ai-hint="comic book cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index < 2}
                  />
                </div>
                <CardHeader className="flex-grow">
                  <CardTitle className="text-lg font-semibold">{comic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground text-sm mb-2">Type: {comic.type}</p>
                   <p className="font-bold text-accent-foreground bg-accent inline-block px-2 py-1 rounded">${comic.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-auto pt-4">
                   <Link href={`/comics/${comic.id}`} passHref legacyBehavior>
                    <Button variant="secondary" className="w-full sm:w-auto flex-1">Details</Button>
                  </Link>
                   <Button
                    variant="outline"
                    className="w-full sm:w-auto flex-1"
                    onClick={() => handleAddToCart(comic)}
                    aria-label={`Add ${comic.title} to cart`}
                  >
                     Add to Cart
                   </Button>
                </CardFooter>
              </Card>
            ))
        ) : (
            <p className="col-span-full text-center text-muted-foreground">No comics available at the moment.</p>
        )}
      </div>
       <div className="text-center mt-12 space-x-4">
           <Link href="/gallery" passHref legacyBehavior>
               <Button variant="outline" size="lg">View Full Gallery</Button>
           </Link>
           <Link href="/customize" passHref legacyBehavior>
               <Button size="lg" className="bg-accent hover:bg-accent/90">Create Custom Comic</Button>
           </Link>
       </div>
    </div>
  );
}

export default function Home() {
  return <HomePageContent />;
}
