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
import { uploadImage } from '@/services/comic-service'; // Use the updated service
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { Loader2, Upload, ShoppingCart } from 'lucide-react';

const formSchema = z.object({
  // Image file is required
  imageFile: z.instanceof(File).refine(file => file !== undefined && file.size > 0, "An image file is required."),
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
  const [isSubmitting, setIsSubmitting] = useState(false); // General submitting state

  const form = useForm<CustomizationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      imageFile: undefined, // Explicitly default to undefined
    },
     mode: "onChange", // Validate on change for better UX
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file, { shouldValidate: true }); // Validate after setting value
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('imageFile', undefined, { shouldValidate: true }); // Validate after clearing
      setPreviewUrl(null);
    }
     // No need to manually trigger, setValue with shouldValidate handles it if mode is onChange/onBlur
  };

  // Renamed function for clarity
  const onSubmitCustomization: SubmitHandler<CustomizationFormData> = async (data) => {
    // Schema validation already ensures imageFile exists here
    if (!data.imageFile) {
      // This case should ideally not be hit due to zod refinement, but as a safeguard:
      toast({ title: 'Error', description: 'Image file is missing.', variant: 'destructive'});
      return;
    }

    setIsUploading(true);
    setIsSubmitting(true); // Start general loading state
    let uploadedImageUrl = '';

    try {
      // Upload the image using the API service
      uploadedImageUrl = await uploadImage(data.imageFile);
      toast({ title: 'Image Uploaded Successfully', description: 'Preparing custom comic...' });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Image Upload Failed',
        description: (error as Error).message || 'Could not upload your image. Please try again.',
        variant: 'destructive',
      });
      setIsUploading(false);
      setIsSubmitting(false); // Stop loading state
      return;
    } finally {
      setIsUploading(false); // Stop upload-specific loading indicator
    }

    // Create a unique ID for the custom cart item
    const customItemId = `custom-${Date.now()}`;

    // Add the custom item details to the cart using the context
    addItem({
        id: customItemId,
        title: `Custom Comic ${comicId ? `(Based on ID ${comicId.substring(0,5)}...)` : ''}`, // More descriptive title
        price: CUSTOM_COMIC_PRICE, // Use the defined price
        quantity: 1,
        imageUrl: uploadedImageUrl, // Use the URL returned by the API
        isCustom: true,
        notes: data.notes,
    });

    setIsSubmitting(false); // Stop general loading state
    // Toast for adding to cart is handled by the addItem function in CartContext

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
            {/* Ensure onSubmit uses the correct handler */}
            <form onSubmit={form.handleSubmit(onSubmitCustomization)} className="space-y-6">
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => ( // field doesn't have value for file input, use onChange handler
                  <FormItem>
                    <FormLabel
                        htmlFor="image-upload"
                        className={cn(
                            "flex items-center gap-2 cursor-pointer text-primary font-semibold hover:underline",
                            (isUploading || isSubmitting) && "cursor-not-allowed opacity-50"
                        )}
                    >
                      <Upload className="h-5 w-5" />
                      {previewUrl ? 'Change Image' : 'Upload Image *'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        // Use custom onChange handler instead of field.onChange
                        onChange={handleImageChange}
                        // ref={field.ref} // Keep ref if needed, but value/onChange are handled differently
                        className="hidden" // Hide the default input
                        disabled={isUploading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      * Required. Upload a picture for your custom comic.
                    </FormDescription>
                    <FormMessage />
                    {previewUrl && (
                      <div className="mt-4 border rounded-lg overflow-hidden w-full aspect-square max-w-xs mx-auto relative bg-muted/50">
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
                        disabled={isUploading || isSubmitting}
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
                 {/* Ensure button uses the correct loading state */}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isUploading || isSubmitting || !form.formState.isValid}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Adding to Cart...'}
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
