'use client';

import type React from 'react';
import { useState, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { uploadImage } from '@/services/comic-service'; // Keep uploadImage
// Remove submitCustomComicOrder import, we'll add to cart instead
// import { submitCustomComicOrder, type CustomComicOrder } from '@/services/comic-service';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { Loader2, Upload, ShoppingCart } from 'lucide-react';

const formSchema = z.object({
  imageFile: z.instanceof(File).optional().refine(file => file !== undefined, "An image is required."),
  notes: z.string().optional(),
});

type CustomizationFormData = z.infer<typeof formSchema>;

// Define a price for custom comics (adjust as needed)
const CUSTOM_COMIC_PRICE = 25.00;

function CustomizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comicId = searchParams.get('comicId'); // Optional base comic ID
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Changed state name

  const form = useForm<CustomizationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('imageFile', undefined);
      setPreviewUrl(null);
    }
     form.trigger('imageFile'); // Trigger validation after file selection
  };

  // Renamed function
  const onAddToCart: SubmitHandler<CustomizationFormData> = async (data) => {
    if (!data.imageFile) {
       form.setError('imageFile', { message: 'Please upload an image.' });
       return;
    }

    setIsUploading(true);
    setIsAddingToCart(true); // Start loading state
    let imageUrl = '';
    try {
      // Still upload the image first
      imageUrl = await uploadImage(data.imageFile);
      toast({ title: 'Image Uploaded Successfully', description: 'Adding custom comic to cart...' });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Image Upload Failed',
        description: 'Could not upload your image. Please try again.',
        variant: 'destructive',
      });
      setIsUploading(false);
      setIsAddingToCart(false); // Stop loading state
      return;
    } finally {
      setIsUploading(false); // Stop upload-specific loading
    }

    // Create a unique ID for the custom cart item (e.g., using timestamp or UUID)
    const customItemId = `custom-${Date.now()}`;

    // Add the custom item details to the cart
    addItem({
        id: customItemId,
        title: `Custom Comic ${comicId ? `(Based on ${comicId})` : ''}`, // More descriptive title
        price: CUSTOM_COMIC_PRICE, // Use the defined price
        quantity: 1,
        imageUrl: imageUrl, // Use the uploaded image URL
        isCustom: true,
        notes: data.notes,
    });

    setIsAddingToCart(false); // Stop loading state
    toast({
        title: 'Custom Comic Added to Cart!',
        description: 'Your custom comic request has been added to your cart.',
    });

    // Redirect to the cart page after adding
    router.push('/cart');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Customize Your Comic</CardTitle>
          <CardDescription>Upload an image, add notes, and add to your cart.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddToCart)} className="space-y-6"> {/* Use onAddToCart */}
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer text-primary font-semibold hover:underline">
                      <Upload className="h-5 w-5" />
                      Upload Image
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isUploading || isAddingToCart}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a picture from your gallery or camera. This will be used for your custom comic.
                    </FormDescription>
                    <FormMessage />
                    {previewUrl && (
                      <div className="mt-4 border rounded-lg overflow-hidden w-full aspect-square max-w-xs mx-auto relative">
                        <Image src={previewUrl} alt="Image Preview" layout="fill" objectFit="contain" />
                      </div>
                    )}
                    {isUploading && (
                        <div className="flex items-center justify-center mt-2 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading Image...
                        </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Optional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special instructions? (e.g., character pose, background details, speech bubbles)"
                        {...field}
                        rows={4}
                        disabled={isUploading || isAddingToCart}
                      />
                    </FormControl>
                    <FormDescription>
                      Let us know any specific details you want in your custom comic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="p-0 pt-6">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isUploading || isAddingToCart}>
                  {isAddingToCart ? ( // Check isAddingToCart state
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                     <ShoppingCart className="mr-2 h-4 w-4" /> Add Custom Comic to Cart (${CUSTOM_COMIC_PRICE.toFixed(2)})
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomizePage() {
  return <CustomizePageContent />;
}
