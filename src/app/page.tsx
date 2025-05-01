'use client';

import type React from 'react';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {getComics, type Comic} from '@/services/comic-service'; // Assuming service returns mock data
import {Skeleton} from '@/components/ui/skeleton';
import {ShoppingCart} from 'lucide-react'; // Assuming CartIcon usage later
import {useToast} from '@/hooks/use-toast';
// Remove QueryClient imports
// import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query';
import {useQuery} from '@tanstack/react-query'; // Keep useQuery

// Remove QueryClient instantiation
// const queryClient = new QueryClient();

function HomePageContent() {
  const {toast} = useToast();
  const {data: comics, isLoading, error} = useQuery<Comic[], Error>({
    queryKey: ['comics'],
    queryFn: getComics,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
              <CardFooter className="flex justify-between gap-2">
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
    toast({
      title: 'Error loading comics',
      description: error.message,
      variant: 'destructive',
    });
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        Failed to load comics. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Featured Comics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {comics?.slice(0, 4).map((comic) => ( // Displaying only first 4 as samples
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
                priority={comics.indexOf(comic) < 2} // Prioritize loading first few images
              />
            </div>
            <CardHeader className="flex-grow">
              <CardTitle className="text-lg font-semibold">{comic.title}</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-sm mb-2">Category: {comic.category}</p>
               <p className="font-bold text-accent-foreground bg-accent inline-block px-2 py-1 rounded">${comic.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-auto pt-4">
              {/* Link to a potential details page */}
               <Link href={`/comics/${comic.id}`} passHref legacyBehavior>
                <Button variant="secondary" className="w-full sm:w-auto flex-1">Details</Button>
              </Link>
              <Link href={`/customize?comicId=${comic.id}`} passHref legacyBehavior>
                 <Button variant="default" className="w-full sm:w-auto flex-1 bg-accent hover:bg-accent/90">Customize</Button>
              </Link>
               {/* Add to Cart Button (Functionality to be added) */}
              {/* <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  // TODO: Implement add to cart functionality
                  toast({ title: `${comic.title} added to cart (simulation)` });
                }}
                aria-label={`Add ${comic.title} to cart`}
                className="hidden sm:inline-flex">
                <ShoppingCart />
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="text-center mt-12">
           <Link href="/gallery" passHref legacyBehavior>
               <Button variant="outline" size="lg">View Full Gallery</Button>
           </Link>
       </div>
    </div>
  );
}


// Remove the wrapper component
export default function Home() {
  return <HomePageContent />;
}
