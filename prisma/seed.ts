import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Admin User',
    email: 'admin@comichub.com',
    password: 'password', // Plain text for now
    isAdmin: true,
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password', // Plain text for now
    isAdmin: false,
  },
];

const productData: Prisma.ProductCreateInput[] = [
    {
      title: 'Cosmic Crusaders #1',
      imageUrl: `https://picsum.photos/seed/cosmic1/400/600`,
      price: 4.99,
      description: 'The start of a new galactic saga! Join the Crusaders as they defend the galaxy from the Void Lord.',
      type: 'sample',
    },
    {
      title: 'Midnight Detective: Case Files',
      imageUrl: `https://picsum.photos/seed/detective2/400/600`,
      price: 5.50,
      description: 'A gritty noir tale set in the rain-soaked streets of Neo-Veridia. Can Detective Harding solve the case before the city consumes him?',
      type: 'sample',
    },
    {
      title: 'Chronicles of Atheria: The Lost Kingdom',
      imageUrl: `https://picsum.photos/seed/atheria3/400/600`,
      price: 6.99,
      description: 'Embark on an epic fantasy adventure to uncover the secrets of a long-lost civilization.',
      type: 'sample',
    },
    {
      title: 'Quantum Leapfrog',
      imageUrl: `https://picsum.photos/seed/quantum4/400/600`,
      price: 3.99,
      description: 'A quirky, mind-bending journey through time and space with an unlikely hero.',
      type: 'sample',
    },
     {
      title: 'Guardians of the Metropolis',
      imageUrl: `https://picsum.photos/seed/guardians5/400/600`,
      price: 4.50,
      description: 'Classic superhero action protecting the bustling city from supervillains.',
      type: 'sample',
    },
    {
      title: 'The Whispering Woods',
      imageUrl: `https://picsum.photos/seed/woods6/400/600`,
      price: 5.99,
      description: 'A haunting horror story about campers who venture too deep into the ancient forest.',
      type: 'sample',
    },
     {
      title: 'Robo-Rampage',
      imageUrl: `https://picsum.photos/seed/robo7/400/600`,
      price: 4.00,
      description: 'Giant robots clash in a battle for the future!',
      type: 'sample',
    },
    {
      title: 'Slice of Life: Cafe Moments',
      imageUrl: `https://picsum.photos/seed/cafe8/400/600`,
      price: 3.50,
      description: 'Heartwarming stories centered around a cozy neighborhood cafe.',
      type: 'sample',
    },
];


async function main() {
  console.log(`Start seeding ...`);

  // Seed Users
  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created or found user with id: ${user.id}`);
  }

  // Seed Products
  for (const p of productData) {
    const product = await prisma.product.create({
      data: p,
    });
    console.log(`Created product with id: ${product.id}`);
  }

  // Seed an example custom order for the test user
  const testUser = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  if (testUser) {
    const customOrderItems = [
        {
            productId: `custom-${Date.now()}`, // Simulate a custom ID
            title: 'My Custom Superhero',
            price: 25.00,
            quantity: 1,
            imageUrl: 'https://picsum.photos/seed/custom1/600/900', // Example custom image URL
            isCustom: true,
            notes: 'Make the hero fly over a city skyline.',
        },
         {
            // Example of adding a sample product to the same order
            productId: '1', // Link to existing product 'Cosmic Crusaders #1'
            title: 'Cosmic Crusaders #1',
            price: 4.99,
            quantity: 2,
            imageUrl: `https://picsum.photos/seed/cosmic1/400/600`,
            isCustom: false,
            notes: '',
        }
    ];
    const totalPrice = customOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        customerName: testUser.name,
        itemsJson: JSON.stringify(customOrderItems), // Store items as JSON
        totalPrice: totalPrice,
        status: 'In Production',
        // Link the sample product item to the Product table if possible
        // This requires more complex logic to connect based on itemsJson, skipped for simplicity in seed
        // productId: 1, // Example if the *entire* order was just for one product
        customImageUrl: customOrderItems.find(item => item.isCustom)?.imageUrl, // Save main custom image URL if exists
        notes: customOrderItems.find(item => item.isCustom)?.notes, // Save main custom notes if exists
      },
    });
    console.log(`Created custom order with id: ${order.id} for user ${testUser.email}`);
  } else {
    console.warn('Could not find test user test@example.com to create a seed order.');
  }


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
