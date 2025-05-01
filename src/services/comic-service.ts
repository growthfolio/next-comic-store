/**
 * Represents a comic book product.
 */
export interface Comic {
  id: string;
  title: string;
  imageUrl?: string; // Make imageUrl optional for placeholders
  price: number;
  description: string;
  category: string;
}

// Mock data is now handled by the API route /api/products

/**
 * Asynchronously retrieves a list of comic book products from the API.
 * @returns A promise that resolves to an array of Comic objects.
 */
export async function getComics(): Promise<Comic[]> {
  console.log('Fetching comics from API...');
  try {
    const response = await fetch('/api/products'); // Fetch from the new API endpoint
    if (!response.ok) {
      throw new Error(`Failed to fetch comics: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Comic[];
  } catch (error) {
      console.error("Error in getComics:", error);
      // Optionally return empty array or re-throw specific error type
      return []; // Return empty array on error to avoid breaking UI components expecting an array
  }
}

/**
 * Asynchronously retrieves details for a specific comic book product from the API.
 * @param id The ID of the comic to fetch.
 * @returns A promise that resolves to a Comic object or null if not found.
 */
export async function getComicById(id: string): Promise<Comic | null> {
    console.log(`Fetching comic ${id} from API...`);
    try {
        const response = await fetch(`/api/products/${id}`); // Fetch from the specific product API endpoint
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Comic not found
            }
            throw new Error(`Failed to fetch comic ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data as Comic;
    } catch (error) {
        console.error(`Error in getComicById (${id}):`, error);
        return null; // Return null on error
    }
}


/**
 * Represents the data needed to create a customized comic book order.
 * (Keeping this interface, but submission logic will change)
 */
export interface CustomComicOrder {
  image: string; // URL of the uploaded image
  notes?: string;
  comicId?: string; // Optional: ID of the base comic being customized
}

/**
 * Asynchronously submits a custom comic book order (will be handled by addOrder).
 * This function might be deprecated or adapted later.
 * @param order The custom comic order data.
 * @returns A promise that resolves when the order is successfully submitted.
 */
export async function submitCustomComicOrder(order: CustomComicOrder): Promise<void> {
  console.warn('submitCustomComicOrder is deprecated. Use addOrder via the /api/orders endpoint.');
  // This function's logic should be integrated into the checkout process that calls POST /api/orders
  // For now, just log a warning.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate quick operation
  return;
}

/**
 * Asynchronously uploads an image using the API endpoint.
 * @param image The image file to upload.
 * @returns A promise that resolves to the URL of the uploaded image.
 */
export async function uploadImage(image: File): Promise<string> {
  console.log('Uploading image via API:', image.name);
  try {
    const formData = new FormData();
    formData.append('image', image); // Use 'image' as the key the API expects

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown upload error' }));
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
      throw error; // Re-throw the error to be handled by the calling component
  }
}
