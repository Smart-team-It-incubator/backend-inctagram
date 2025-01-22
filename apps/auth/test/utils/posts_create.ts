import { PrismaClient } from "@prisma/core_app";

export async function seedPosts(prisma: PrismaClient, userId: string) {
  const getRandomText = () => {
    const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join(' ');
  };

  const getRandomLocation = () => {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  const getRandomPhotos = () => {
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
      url: `https://example.com/photo_${index + 1}_${Math.random().toString(36).substring(7)}.jpg`,
      photoDescription: `Photo description ${index + 1}`,
    }));
  };

  const posts = Array.from({ length: 10 }, () => ({
    text: getRandomText(),
    location: getRandomLocation(),
    photos: getRandomPhotos(),
  }));

  for (const post of posts) {
    await prisma.post.create({
      data: {
        text: post.text,
        location: post.location,
        userId,
        photos: {
          create: post.photos,
        },
      },
      include: {
        photos: true,
      },
    });
  }

  console.log('10 posts created successfully');
}