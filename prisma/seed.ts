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
  console.log("Seeding users...");
  for (const u of userData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created or found user with id: ${user.id}`);
  }

  // Seed Products (Samples)
  console.log("Seeding sample products...");
  // Clear existing products first to avoid duplicates if IDs change
  await prisma.product.deleteMany({});
  const createdProducts: Record<string, number> = {}; // To store title -> id mapping
  for (const p of productData) {
    const product = await prisma.product.create({
      data: p,
    });
    createdProducts[p.title] = product.id; // Store ID by title
    console.log(`Created product "${p.title}" with id: ${product.id}`);
  }

  // Seed an example custom order for the test user
  console.log("Seeding example order for test user...");
  const testUser = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  if (testUser) {
     // Clear existing orders for the test user to avoid duplicates on re-seed
     await prisma.order.deleteMany({ where: { userId: testUser.id } });

    const cosmicCrusadersProductId = createdProducts['Cosmic Crusaders #1'];
    if (!cosmicCrusadersProductId) {
        console.warn("Could not find product ID for 'Cosmic Crusaders #1'. Skipping adding it to the seed order.");
    }

    const orderItems = [
        {
            productId: `custom-${Date.now()}`, // Simulate a custom ID (string)
            title: 'My Custom Superhero',
            price: 25.00,
            quantity: 1,
            imageUrl: 'https://picsum.photos/seed/custom1/600/900', // Example custom image URL
            isCustom: true,
            notes: 'Make the hero fly over a city skyline.',
        },
        // Only add if the product ID was found
        ...(cosmicCrusadersProductId ? [{
            productId: cosmicCrusadersProductId, // Link to existing product ID (number)
            title: 'Cosmic Crusaders #1',
            price: 4.99,
            quantity: 2,
            imageUrl: `https://picsum.photos/seed/cosmic1/400/600`,
            isCustom: false,
            notes: '',
        }] : [])
    ];
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const firstCustomItem = orderItems.find(item => item.isCustom);

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        customerName: testUser.name,
        itemsJson: JSON.stringify(orderItems), // Store items as JSON string
        totalPrice: totalPrice,
        status: 'In Production', // Example status
        // productId: cosmicCrusadersProductId, // Link to one product if the entire order IS that product (optional, maybe remove)
        // Store primary custom details directly on order for easier querying if needed
        customImageUrl: firstCustomItem?.imageUrl,
        notes: firstCustomItem?.notes,
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

