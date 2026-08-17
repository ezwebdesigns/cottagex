const SITE_URL = 'https://chaletexpress.com';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Chalet Express',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'socialmediacanada@gmail.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://facebook.com/chaletxpress',
      'https://instagram.com/chaletxpress',
      'https://tiktok.com/@chaletxpress',
      'https://x.com/chaletxpress',
      'https://youtube.com/chaletxpress',
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Chalet Express',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/en/search/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

type Crumb = { name: string; url: string };

export function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ArticleSchema({ title, description, image, date, dateModified, url, author }: {
  title: string;
  description: string;
  image: string;
  date: string;
  dateModified?: string;
  url?: string;
  author?: string;
}) {
  const absImage = image && !image.startsWith('http') ? `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}` : image;
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: absImage,
    datePublished: date,
    dateModified: dateModified || date,
    author: {
      '@type': 'Person',
      name: author || 'Chalet Express Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chalet Express',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
  if (url) {
    schema.mainEntityOfPage = { '@type': 'WebPage', '@id': url };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FAQPageSchema({ items }: {
  items: { question: string; answer: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function PlaceSchema({ name, description, image, url, address }: {
  name: string;
  description: string;
  image: string;
  url: string;
  address?: string;
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description,
    image,
    url,
    containedInPlace: {
      '@type': 'Country',
      name: 'Canada',
    },
  };
  if (address) {
    schema.address = { '@type': 'PostalAddress', addressCountry: address };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ItemListSchema({ items, url }: {
  items: {
    name: string;
    image?: string;
    url?: string;
    price?: number;
    rating?: number;
    reviews?: number;
  }[];
  url: string;
}) {
  const listItems = items.slice(0, 50).map((item, i) => {
    const product: Record<string, any> = {
      '@type': 'Product',
      name: item.name,
      category: 'Vacation Rental',
    };
    if (item.image) product.image = item.image;
    if (item.url) product.url = item.url;

    const offer: Record<string, any> = {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
    };
    if (item.url) offer.url = item.url;
    if (item.price != null) offer.price = item.price;
    product.offers = offer;

    if (item.rating != null) {
      product.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: item.rating,
        reviewCount: item.reviews || 1,
      };
    }

    return {
      '@type': 'ListItem',
      position: i + 1,
      item: product,
    };
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url,
    numberOfItems: items.length,
    itemListElement: listItems,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
