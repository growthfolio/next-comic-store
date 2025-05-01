'use client';

import type React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getComicById, type Comic } from '@/services/comic-service'; // Use getComicById
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { ArrowLeft, ShoppingCart, Pencil, AlertTriangle } from 'lucide-react';

function ComicDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function
  const comicId = params.id as string;

   // Fetch the specific comic by ID using useQuery
  const { data: comic, isLoading, error, isError } = useQuery<Comic | null, Error>({
    queryKey: ['comic', comicId], // Query key includes the comic ID
    queryFn: () => getComicById(comicId), // Fetch function using the ID
    enabled: !!comicId, // Only run query if comicId exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });


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
         // Toast is now handled in CartContext
    } else {
         toast({
            title: 'Error adding to cart',
            description: 'Comic details not available.',
            variant: 'destructive',
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

  if (isError) {
    // Error handled by useQuery, display message
    console.error(`Error fetching comic ${comicId}:`, error);
     return (
        <div className="container mx-auto px-4 py-8 text-center text-destructive">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to load comic details.</p>
          <p className="text-muted-foreground mb-4">({error.message})</p>
          <Button variant="outline" onClick={() => router.back()}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      );
  }

  if (!comic) {
    // Handle case where comic is null (e.g., 404 from API)
    return (
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold mb-4">Comic not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
          </Button>
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
