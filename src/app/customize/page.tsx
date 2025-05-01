'use client';

import type React from 'react';
import {useState, type ChangeEvent} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Image from 'next/image';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {uploadImage, submitCustomComicOrder, type CustomComicOrder} from '@/services/comic-service';
import {useToast} from '@/hooks/use-toast';
import {Loader2, Upload} from 'lucide-react';
// Remove QueryClient imports
// import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const formSchema = z.object({
  imageFile: z.instanceof(File).optional().refine(file => file !== undefined, "An image is required."),
  notes: z.string().optional(),
});

type CustomizationFormData = z.infer<typeof formSchema>;

// Remove QueryClient instantiation
// const queryClient = new QueryClient();

function CustomizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comicId = searchParams.get('comicId'); // Optional: Pre-select comic if coming from Home/Gallery
  const {toast} = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit: SubmitHandler<CustomizationFormData> = async (data) => {
    if (!data.imageFile) {
       form.setError('imageFile', { message: 'Please upload an image.' });
       return;
    }

    setIsUploading(true);
    setIsSubmitting(true);
    let imageUrl = '';
    try {
      imageUrl = await uploadImage(data.imageFile);
      toast({ title: 'Image Uploaded Successfully', description: 'Proceeding with order submission.' });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Image Upload Failed',
        description: 'Could not upload your image. Please try again.',
        variant: 'destructive',
      });
      setIsUploading(false);
      setIsSubmitting(false);
      return;
    } finally {
      setIsUploading(false);
    }

    const orderData: CustomComicOrder = {
      image: imageUrl,
      notes: data.notes,
      // Optionally include comicId if needed by the backend
      // comicId: comicId,
    };

    try {
      await submitCustomComicOrder(orderData);
      toast({
        title: 'Custom Comic Requested!',
        description: 'Your custom comic order has been submitted successfully.',
      });
      // Redirect to a confirmation or order history page
      router.push('/order-confirmation'); // Example redirect
    } catch (error) {
      console.error('Custom order submission failed:', error);
      toast({
        title: 'Order Submission Failed',
        description: 'Could not submit your custom order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Customize Your Comic</CardTitle>
          <CardDescription>Upload an image and add any special instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                       {/* Hidden actual input, triggered by label */}
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden" // Hide the default input style
                        disabled={isUploading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a picture from your gallery or camera.
                    </FormDescription>
                    <FormMessage />
                     {/* Image Preview */}
                    {previewUrl && (
                      <div className="mt-4 border rounded-lg overflow-hidden w-full aspect-square max-w-xs mx-auto relative">
                        <Image src={previewUrl} alt="Image Preview" layout="fill" objectFit="contain" />
                      </div>
                    )}
                     {/* Uploading indicator */}
                    {isUploading && (
                        <div className="flex items-center justify-center mt-2 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
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
                        placeholder="Any special instructions? (e.g., character pose, background details)"
                        {...field}
                        rows={4}
                        disabled={isUploading || isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Let us know any specific details you want in your comic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="p-0 pt-6">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isUploading || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Custom Comic'
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


// Remove the wrapper component
export default function CustomizePage() {
  return <CustomizePageContent />;
}
