'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getComics, type Comic } from '@/services/comic-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { Search, Filter, ShoppingCart } from 'lucide-react';

function GalleryPageContent() {
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function

  // Fetch comics from API using useQuery
  const { data: comics, isLoading, error } = useQuery<Comic[], Error>({
    queryKey: ['comics'], // Consistent query key with homepage
    queryFn: getComics,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    // No need for onError here unless specific action is needed, useQuery handles global errors
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);

   // Derive categories once comics data is available
   useEffect(() => {
     if (comics) {
       const uniqueCategories = ['all', ...new Set(comics.map(comic => comic.category))];
       setCategories(uniqueCategories);
     }
   }, [comics]);


   // Filter comics based on search term and category
  useEffect(() => {
    if (comics) {
      let tempComics = comics;

      // Filter by category
      if (selectedCategory !== 'all') {
        tempComics = tempComics.filter(comic => comic.category === selectedCategory);
      }

      // Filter by search term (title)
      if (searchTerm) {
        tempComics = tempComics.filter(comic =>
          comic.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredComics(tempComics);
    } else {
      setFilteredComics([]); // Ensure it's an empty array if comics are not loaded
    }
  }, [comics, searchTerm, selectedCategory]);

  const handleAddToCart = (comic: Comic) => {
     addItem({
        id: comic.id,
        title: comic.title,
        price: comic.price,
        quantity: 1,
        imageUrl: comic.imageUrl || `https://picsum.photos/seed/${comic.id}/100/150`,
        isCustom: false,
     });
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Comic Gallery</h1>
        {/* Filter/Search Skeletons */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full md:w-48" />
        </div>
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-lg rounded-lg">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-4" />
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Skeleton className="h-10 w-1/3" />
                 <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Error is handled by useQuery, display message on page
    console.error("Error fetching comics for gallery:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        Failed to load comics gallery. Please try refreshing the page. ({error.message})
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Comic Gallery</h1>

       {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
         <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search by title..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 w-full"
           />
         </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Filter className="h-5 w-5 text-muted-foreground" />
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
             <SelectTrigger className="w-full md:w-[180px]">
               <SelectValue placeholder="Filter by category" />
             </SelectTrigger>
             <SelectContent>
               {categories.map(category => (
                 <SelectItem key={category} value={category}>
                   {category === 'all' ? 'All Categories' : category}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      {/* Comic Grid */}
      {filteredComics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredComics.map((comic) => (
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
                {/* Link to a details page */}
                <Link href={`/comics/${comic.id}`} passHref legacyBehavior>
                   <Button variant="secondary" className="w-full sm:w-auto flex-1 text-xs px-2">Details</Button>
                </Link>
                 {/* Add to Cart Button */}
                 <Button
                    variant="outline"
                    className="w-full sm:w-auto flex-1 text-xs px-2"
                    onClick={() => handleAddToCart(comic)}
                    aria-label={`Add ${comic.title} to cart`}
                 >
                     <ShoppingCart className="h-4 w-4 mr-1" /> Add
                 </Button>
                <Link href={`/customize?comicId=${comic.id}`} passHref legacyBehavior>
                  <Button variant="default" className="w-full sm:w-auto flex-1 bg-accent hover:bg-accent/90 text-xs px-2">Customize</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-12 text-muted-foreground">
             <p>No comics found matching your criteria.</p>
         </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return <GalleryPageContent />;
}
