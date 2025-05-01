'use client';

import type React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getComics, type Comic } from '@/services/comic-service';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { ArrowLeft, ShoppingCart, Pencil } from 'lucide-react';

function ComicDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function
  const comicId = params.id as string;

   // Fetch all comics and then filter, or modify getComics to fetch by ID if possible
  const { data: comics, isLoading, error } = useQuery<Comic[], Error>({
    queryKey: ['comics', comicId], // Include comicId in key if filtering client-side
    queryFn: getComics,
    enabled: !!comicId, // Only run query if comicId exists
  });

  // Find the specific comic from the fetched list
  const comic = comics?.find(c => c.id === comicId);

   const handleAddToCart = () => {
    if (comic) {
        addItem({
            id: comic.id,
            title: comic.title,
            price: comic.price,
            quantity: 1,
            imageUrl: comic.imageUrl || `https://picsum.photos/seed/${comic.id}/100/150`,
            isCustom: false,
        });
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
         <Skeleton className="h-8 w-32 mb-8" /> {/* Back button skeleton */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <Skeleton className="w-full aspect-[2/3] rounded-lg" />
           </div>
           <div className="space-y-6">
             <Skeleton className="h-8 w-3/4" />
             <Skeleton className="h-5 w-1/4" />
             <Skeleton className="h-5 w-1/3" />
             <Skeleton className="h-20 w-full" />
             <div className="flex gap-4">
               <Skeleton className="h-10 w-32" />
               <Skeleton className="h-10 w-32" />
             </div>
           </div>
         </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Error loading comic details',
      description: error.message,
      variant: 'destructive',
    });
     return (
        <div className="container mx-auto px-4 py-8 text-center text-destructive">
          Failed to load comic details. <Button variant="link" onClick={() => router.back()}>Go Back</Button>
        </div>
      );
  }

  if (!comic) {
    return (
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          Comic not found. <Button variant="link" onClick={() => router.back()}>Go Back</Button>
        </div>
      );
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       <Button variant="ghost" onClick={() => router.back()} className="mb-8">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
       </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
         {/* Image Column */}
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
          <Image
             src={comic.imageUrl || `https://picsum.photos/seed/${comic.id}/600/900`}
             alt={comic.title}
             fill
             style={{objectFit: 'cover'}}
             data-ai-hint="comic book cover large"
             sizes="(max-width: 768px) 100vw, 50vw"
             priority // Prioritize loading the main image
          />
        </div>

         {/* Details Column */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{comic.title}</h1>
          <p className="text-lg text-muted-foreground">Category: {comic.category}</p>
          <p className="text-2xl font-bold text-accent-foreground bg-accent inline-block px-3 py-1 rounded-md">${comic.price.toFixed(2)}</p>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">{comic.description || 'No description available.'}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             {/* Add to Cart Button */}
             <Button
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
             {/* Customize Button */}
            <Link href={`/customize?comicId=${comic.id}`} passHref legacyBehavior>
               <Button size="lg" className="flex-1 bg-accent hover:bg-accent/90">
                  <Pencil className="mr-2 h-5 w-5" /> Customize This Comic
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComicDetailsPage() {
  return <ComicDetailsPageContent />;
}
