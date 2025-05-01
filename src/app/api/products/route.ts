// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import type { Comic } from '@/services/comic-service'; // Reuse existing type

// Mock data - reusing and centralizing from comic-service
const mockComics: Comic[] = [
    {
      id: '1',
      title: 'Cosmic Crusaders #1',
      imageUrl: `https://picsum.photos/seed/cosmic1/400/600`,
      price: 4.99,
      description: 'The start of a new galactic saga! Join the Crusaders as they defend the galaxy from the Void Lord.',
      category: 'Sci-Fi Superhero',
    },
    {
      id: '2',
      title: 'Midnight Detective: Case Files',
      imageUrl: `https://picsum.photos/seed/detective2/400/600`,
      price: 5.50,
      description: 'A gritty noir tale set in the rain-soaked streets of Neo-Veridia. Can Detective Harding solve the case before the city consumes him?',
      category: 'Noir',
    },
    {
      id: '3',
      title: 'Chronicles of Atheria: The Lost Kingdom',
      imageUrl: `https://picsum.photos/seed/atheria3/400/600`,
      price: 6.99,
      description: 'Embark on an epic fantasy adventure to uncover the secrets of a long-lost civilization.',
      category: 'Fantasy',
    },
    {
      id: '4',
      title: 'Quantum Leapfrog',
      imageUrl: `https://picsum.photos/seed/quantum4/400/600`,
      price: 3.99,
      description: 'A quirky, mind-bending journey through time and space with an unlikely hero.',
      category: 'Sci-Fi Comedy',
    },
     {
      id: '5',
      title: 'Guardians of the Metropolis',
      imageUrl: `https://picsum.photos/seed/guardians5/400/600`,
      price: 4.50,
      description: 'Classic superhero action protecting the bustling city from supervillains.',
      category: 'Superhero',
    },
    {
      id: '6',
      title: 'The Whispering Woods',
      imageUrl: `https://picsum.photos/seed/woods6/400/600`,
      price: 5.99,
      description: 'A haunting horror story about campers who venture too deep into the ancient forest.',
      category: 'Horror',
    },
     {
      id: '7',
      title: 'Robo-Rampage',
      imageUrl: `https://picsum.photos/seed/robo7/400/600`,
      price: 4.00,
      description: 'Giant robots clash in a battle for the future!',
      category: 'Mecha',
    },
    {
      id: '8',
      title: 'Slice of Life: Cafe Moments',
      imageUrl: `https://picsum.photos/seed/cafe8/400/600`,
      price: 3.50,
      description: 'Heartwarming stories centered around a cozy neighborhood cafe.',
      category: 'Slice of Life',
    },
];

export async function GET() {
  // Simulate potential delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return NextResponse.json(mockComics);
}

// In-memory store for shared data access within this module if needed later
export const productsStore = {
  getAll: () => mockComics,
  getById: (id: string) => mockComics.find(comic => comic.id === id),
};
