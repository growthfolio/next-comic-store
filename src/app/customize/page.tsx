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
import { uploadImage } from '@/services/comic-service';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { Loader2, Upload, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn


const formSchema = z.object({
  imageFile: z.instanceof(File).refine(file => file !== undefined && file.size > 0, "An image file is required."),
  notes: z.string().optional(),
});

type CustomizationFormData = z.infer<typeof formSchema>;

const CUSTOM_COMIC_PRICE = 25.00;

function CustomizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comicIdParam = searchParams.get('comicId'); // Optional base comic ID (string)
  const { toast } = useToast();
  const { addItem } = useCart();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomizationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      imageFile: undefined,
    },
     mode: "onChange",
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('imageFile', undefined, { shouldValidate: true });
      setPreviewUrl(null);
    }
  };

  const onSubmitCustomization: SubmitHandler<CustomizationFormData> = async (data) => {
    if (!data.imageFile) {
      toast({ title: 'Error', description: 'Image file is missing.', variant: 'destructive'});
      return;
    }

    setIsUploading(true);
    setIsSubmitting(true);
    let uploadedImageUrl = '';

    try {
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
      setIsSubmitting(false);
      return;
    } finally {
      setIsUploading(false);
    }

    // Create a unique ID for the custom cart item (use string format)
    const customItemId = `custom-${Date.now()}`;
    // Try parsing the base comic ID
    const baseComicId = comicIdParam ? parseInt(comicIdParam, 10) : undefined;

    addItem({
        id: customItemId, // Use string ID for custom items
        // Include base comic ID in title if valid number
        title: `Custom Comic ${baseComicId && !isNaN(baseComicId) ? `(Based on #${baseComicId})` : ''}`,
        price: CUSTOM_COMIC_PRICE,
        quantity: 1,
        imageUrl: uploadedImageUrl,
        isCustom: true,
        notes: data.notes,
    });

    setIsSubmitting(false);
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
            <form onSubmit={form.handleSubmit(onSubmitCustomization)} className="space-y-6">
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
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
                        onChange={handleImageChange}
                        className="hidden"
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
