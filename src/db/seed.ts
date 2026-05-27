import { db } from '@/lib/db';
import { articles, pages, properties, messages, subscribers } from '@/db/schema';
import { initialArticles, initialProperties } from '@/lib/mock-data';

async function seed() {
  console.log('Seeding database...');

  for (const prop of initialProperties) {
    await db.insert(properties).values({
      title: prop.title,
      slug: prop.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      location: prop.location,
      province: prop.province,
      price: prop.price,
      rating: prop.rating,
      reviews: prop.reviews,
      image: prop.image,
      tag: prop.tag,
      description: prop.description,
      isLiked: prop.isLiked,
      isPublished: true,
    });
  }
  console.log(`Seeded ${initialProperties.length} properties`);

  for (const article of initialArticles) {
    await db.insert(articles).values({
      title: article.title,
      slug: article.slug || article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      type: article.isListicle ? 'listicle' : 'standard',
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      author: 'Editorial Team',
      featuredImage: article.image,
      isPublished: true,
    });
  }
  console.log(`Seeded ${initialArticles.length} articles`);

  await db.insert(pages).values({
    title: 'Terms of Service & Affiliate Disclosure',
    slug: 'terms',
    template: 'standard',
    isPublished: true,
  });
  console.log('Seeded pages');

  console.log('Seed complete!');
}

seed().catch(console.error);
