import type { Product } from '@prisma/client'; // Import Prisma's Product type

/**
 * Represents a comic book product, aligning with Prisma's Product model.
 */
export interface Comic extends Omit<Product, 'createdAt' | 'updatedAt'> {
  id: number; // Use number for Prisma ID
  type: string; // Explicitly keep type
}

/**
 * Asynchronously retrieves a list of comic book products from the API.
 * The API route /api/products now uses Prisma.
 * @returns A promise that resolves to an array of Comic objects.
 */
export async function getComics(): Promise<Comic[]> {
  console.log('Fetching comics from API (using Prisma backend)...');
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      throw new Error(`Failed to fetch comics: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
    }
    const data: Product[] = await response.json();
    // Map Prisma Product to frontend Comic interface if needed (here they are compatible)
    return data.map(product => ({
        ...product, // Spread Prisma fields
        // Ensure type compatibility or transformations if interfaces diverge
    }));
  } catch (error) {
      console.error("Error in getComics:", error);
      throw error; // Re-throw the error so react-query can handle it
  }
}

/**
 * Asynchronously retrieves details for a specific comic book product from the API.
 * The API route /api/products/:id now uses Prisma.
 * @param id The ID (number) of the comic to fetch.
 * @returns A promise that resolves to a Comic object or null if not found.
 */
export async function getComicById(id: string | number): Promise<Comic | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
        console.error(`Invalid ID provided to getComicById: ${id}`);
        return null; // Or throw an error
    }
    console.log(`Fetching comic ${numericId} from API (using Prisma backend)...`);
    try {
        const response = await fetch(`/api/products/${numericId}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Comic with ID ${numericId} not found (404).`);
                return null; // Comic not found
            }
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Failed to fetch comic ${numericId}: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
        }
        const data: Product = await response.json();
         // Map Prisma Product to frontend Comic interface if needed
        return { ...data };
    } catch (error) {
        console.error(`Error in getComicById (${numericId}):`, error);
        throw error; // Re-throw for react-query
    }
}


/**
 * Represents the data needed to create a customized comic book order.
 */
export interface CustomComicOrder {
  image: string; // URL of the uploaded image
  notes?: string;
  comicId?: number; // Use number for Prisma ID
}

/**
 * Asynchronously uploads an image using the API endpoint.
 * This function remains the same, interacting with the mock upload endpoint.
 * @param image The image file to upload.
 * @returns A promise that resolves to the URL of the uploaded image.
 */
export async function uploadImage(image: File): Promise<string> {
  console.log('Uploading image via API:', image.name);
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown upload error or non-JSON response' }));
      throw new Error(`Image upload failed: ${response.statusText} - ${errorData.message}`);
    }

    const result = await response.json();
    if (!result.imageUrl) {
        throw new Error('API did not return an imageUrl for the uploaded image.');
    }
    console.log('API upload complete. URL:', result.imageUrl);
    return result.imageUrl;
  } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
  }
}

// submitCustomComicOrder is effectively handled by adding to cart and using addOrder during checkout.
// No direct submission needed here.
