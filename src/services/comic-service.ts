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

// More diverse mock data
const mockComics: Comic[] = [
    {
      id: '1',
      title: 'Cosmic Crusaders #1',
      // imageUrl: 'https://picsum.photos/seed/cosmic1/400/600', // Use picsum for placeholders
      price: 4.99,
      description: 'The start of a new galactic saga! Join the Crusaders as they defend the galaxy from the Void Lord.',
      category: 'Sci-Fi Superhero',
    },
    {
      id: '2',
      title: 'Midnight Detective: Case Files',
      // imageUrl: 'https://picsum.photos/seed/detective2/400/600',
      price: 5.50,
      description: 'A gritty noir tale set in the rain-soaked streets of Neo-Veridia. Can Detective Harding solve the case before the city consumes him?',
      category: 'Noir',
    },
    {
      id: '3',
      title: 'Chronicles of Atheria: The Lost Kingdom',
      // imageUrl: 'https://picsum.photos/seed/atheria3/400/600',
      price: 6.99,
      description: 'Embark on an epic fantasy adventure to uncover the secrets of a long-lost civilization.',
      category: 'Fantasy',
    },
    {
      id: '4',
      title: 'Quantum Leapfrog',
      // imageUrl: 'https://picsum.photos/seed/quantum4/400/600',
      price: 3.99,
      description: 'A quirky, mind-bending journey through time and space with an unlikely hero.',
      category: 'Sci-Fi Comedy',
    },
     {
      id: '5',
      title: 'Guardians of the Metropolis',
      // imageUrl: 'https://picsum.photos/seed/guardians5/400/600',
      price: 4.50,
      description: 'Classic superhero action protecting the bustling city from supervillains.',
      category: 'Superhero',
    },
    {
      id: '6',
      title: 'The Whispering Woods',
      // imageUrl: 'https://picsum.photos/seed/woods6/400/600',
      price: 5.99,
      description: 'A haunting horror story about campers who venture too deep into the ancient forest.',
      category: 'Horror',
    },
     {
      id: '7',
      title: 'Robo-Rampage',
      // imageUrl: 'https://picsum.photos/seed/robo7/400/600',
      price: 4.00,
      description: 'Giant robots clash in a battle for the future!',
      category: 'Mecha',
    },
    {
      id: '8',
      title: 'Slice of Life: Cafe Moments',
      // imageUrl: 'https://picsum.photos/seed/cafe8/400/600',
      price: 3.50,
      description: 'Heartwarming stories centered around a cozy neighborhood cafe.',
      category: 'Slice of Life',
    },
];


/**
 * Asynchronously retrieves a list of comic book products.
 * Simulates API delay.
 * @returns A promise that resolves to an array of Comic objects.
 */
export async function getComics(): Promise<Comic[]> {
  console.log('Fetching comics (mock)...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, this would be an fetch call:
  // const response = await fetch('/api/produtos');
  // if (!response.ok) {
  //   throw new Error('Failed to fetch comics');
  // }
  // return await response.json();
  return mockComics;
}

/**
 * Represents the data needed to create a customized comic book order.
 */
export interface CustomComicOrder {
  image: string; // URL of the uploaded image
  notes?: string;
  comicId?: string; // Optional: ID of the base comic being customized
}

/**
 * Asynchronously submits a custom comic book order.
 * Simulates API delay.
 * @param order The custom comic order data.
 * @returns A promise that resolves when the order is successfully submitted.
 */
export async function submitCustomComicOrder(order: CustomComicOrder): Promise<void> {
  console.log('Submitting custom comic order (mock):', order);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app:
  // const response = await fetch('/api/pedido/personalizado', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(order),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to submit custom order');
  // }
  // Simulate success
  return;
}

/**
 * Asynchronously uploads an image to the backend.
 * Simulates API delay and returns a placeholder URL.
 * @param image The image file to upload.
 * @returns A promise that resolves to the URL of the uploaded image.
 */
export async function uploadImage(image: File): Promise<string> {
  console.log('Uploading image (mock):', image.name, image.size);
  // Simulate network delay and upload process
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real app:
  // const formData = new FormData();
  // formData.append('image', image);
  // const response = await fetch('/api/upload', {
  //   method: 'POST',
  //   body: formData,
  // });
  // if (!response.ok) {
  //   throw new Error('Image upload failed');
  // }
  // const result = await response.json();
  // return result.imageUrl;

  // Simulate a successful upload returning a placeholder URL
  const randomId = Math.random().toString(36).substring(7);
  const mockUrl = `https://picsum.photos/seed/${randomId}/600/900`; // Using picsum as placeholder
  console.log('Mock upload complete. URL:', mockUrl);
  return mockUrl;
}
