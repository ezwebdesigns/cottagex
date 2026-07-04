// Data utilities
// Paste your Base44 code here.
// Mock data for Cottagex — Canadian chalet directory

export const chalets = [
  {
    id: 'ch1',
    name: 'Pinewood Haven',
    location: 'Muskoka, Ontario',
    province: 'ontario',
    price: 289,
    rating: 4.9,
    reviews: 127,
    badge: 'waterfront',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    description: 'A serene lakeside retreat with a private dock, wraparound deck, and floor-to-ceiling windows overlooking the water. Perfect for sunset watching and morning coffee on the dock.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Muskoka%2C+Ontario',
    beds: 3, baths: 2, guests: 6
  },
  {
    id: 'ch2',
    name: 'Lac Bleu Retreat',
    location: 'Mont-Tremblant, Quebec',
    province: 'quebec',
    price: 345,
    rating: 4.8,
    reviews: 89,
    badge: 'remote',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
    description: 'Nestled deep in the Laurentian forest, this A-frame chalet offers complete privacy, a wood-burning stove, and a hot tub under the stars. A true escape from city life.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Mont-Tremblant%2C+Quebec',
    beds: 2, baths: 1, guests: 4
  },
  {
    id: 'ch3',
    name: 'Eagle Cliff Lodge',
    location: 'Banff, Alberta',
    province: 'alberta',
    price: 420,
    rating: 4.9,
    reviews: 203,
    badge: 'mountainView',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    description: 'Perched on a cliff edge with panoramic Rocky Mountain views. Features a stone fireplace, gourmet kitchen, and direct access to hiking trails in Banff National Park.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Banff%2C+Alberta',
    beds: 4, baths: 3, guests: 8
  },
  {
    id: 'ch4',
    name: 'Cedar Shores Cabin',
    location: 'Algonquin, Ontario',
    province: 'ontario',
    price: 199,
    rating: 4.7,
    reviews: 156,
    badge: 'lakeside',
    image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=800&q=80',
    description: 'A cozy log cabin on the shores of a pristine lake inside Algonquin Provincial Park. Canoe included. Fall colors here are absolutely mesmerizing.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Algonquin+Park%2C+Ontario',
    beds: 2, baths: 1, guests: 4
  },
  {
    id: 'ch5',
    name: 'Northern Lights Chalet',
    location: 'Whistler, British Columbia',
    province: 'britishColumbia',
    price: 510,
    rating: 5.0,
    reviews: 78,
    badge: 'secluded',
    image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=800&q=80',
    description: 'An ultra-private chalet in the Whistler backcountry with floor-to-ceiling glass, an outdoor heated pool, and unobstructed views of the Aurora Borealis on clear nights.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Whistler%2C+BC',
    beds: 3, baths: 2, guests: 6
  },
  {
    id: 'ch6',
    name: 'Maple Ridge Lodge',
    location: 'Gatineau, Quebec',
    province: 'quebec',
    price: 265,
    rating: 4.6,
    reviews: 112,
    badge: 'forest',
    image: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=800&q=80',
    description: 'A charming chalet surrounded by maple trees in the Gatineau Hills. Features a cozy reading nook, outdoor fire pit, and is just 30 minutes from Ottawa.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Gatineau%2C+Quebec',
    beds: 3, baths: 2, guests: 6
  },
  {
    id: 'ch7',
    name: 'Glacier View Retreat',
    location: 'Canmore, Alberta',
    province: 'alberta',
    price: 380,
    rating: 4.8,
    reviews: 94,
    badge: 'mountainView',
    image: 'https://images.unsplash.com/photo-1444156239938-8b19a8b50c1f?auto=format&fit=crop&w=800&q=80',
    description: 'Modern mountain retreat with sleek interiors, a private sauna, and breathtaking glacier views from every room. Minutes from Canmore\'s vibrant downtown.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Canmore%2C+Alberta',
    beds: 2, baths: 2, guests: 4
  },
  {
    id: 'ch8',
    name: 'Tamarack Lake House',
    location: 'Haliburton, Ontario',
    province: 'ontario',
    price: 230,
    rating: 4.7,
    reviews: 67,
    badge: 'waterfront',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'A stunning waterfront property on a quiet lake. Features a private beach, kayaks, and a spacious sun deck. Ideal for families and summer getaways.',
    vrboUrl: 'https://www.vrbo.com/search?destination=Haliburton%2C+Ontario',
    beds: 3, baths: 2, guests: 8
  }
];

export const articles = [
  {
    id: 'art1',
    title: '10 Best Waterfront Chalets in Ontario',
    titleFr: 'Les 10 meilleurs chalets bord de l\'eau en Ontario',
    category: 'Ontario',
    categoryFr: 'Ontario',
    readTime: 8,
    date: '2026-06-15',
    dateFr: '15 juin 2026',
    excerpt: 'From Muskoka to Algonquin, discover the most stunning waterfront escapes Ontario has to offer.',
    excerptFr: 'De Muskoka à Algonquin, découvrez les plus belles escapades bord de l\'eau de l\'Ontario.',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Émilie Laurent',
      role: 'Senior Travel Editor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    intro: 'Ontario\'s lake country is a treasure trove of waterfront chalets, each offering a unique blend of wilderness and comfort. Here are our top 10 picks, ranked for their views, amenities, and guest experiences.',
    chaletIds: ['ch1', 'ch4', 'ch8', 'ch2']
  },
  {
    id: 'art2',
    title: 'The Ultimate Quebec Cottage Guide',
    titleFr: 'Le guide ultime des chalets du Québec',
    category: 'Quebec',
    categoryFr: 'Québec',
    readTime: 12,
    date: '2026-05-28',
    dateFr: '28 mai 2026',
    excerpt: 'Everything you need to know about renting a chalet in Quebec\'s stunning Laurentians and beyond.',
    excerptFr: 'Tout ce qu\'il faut savoir pour louer un chalet dans les magnifiques Laurentides et plus encore.',
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Marc Tremblay',
      role: 'Quebec Correspondent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    intro: 'Quebec offers some of Canada\'s most romantic and secluded chalet experiences. From Mont-Tremblant to the Saguenay, this guide covers the best regions, seasons, and properties.',
    chaletIds: ['ch2', 'ch6']
  },
  {
    id: 'art3',
    title: 'Winter Escapes: Alberta\'s Hidden Gems',
    titleFr: 'Escapades hivernales : les trésors cachés de l\'Alberta',
    category: 'Alberta',
    categoryFr: 'Alberta',
    readTime: 6,
    date: '2026-06-02',
    dateFr: '2 juin 2026',
    excerpt: 'Discover Alberta\'s most secluded winter chalets, from glacier-view lodges to backcountry cabins.',
    excerptFr: 'Découvrez les chalets d\'hiver les plus isolés de l\'Alberta, des lodges vue glacier aux cabanes en pleine nature.',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Sarah Nakai',
      role: 'Adventure Writer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
    },
    intro: 'Alberta in winter is pure magic. Here are our favorite hidden gem chalets near Banff and Canmore, perfect for cozying up after a day on the slopes.',
    chaletIds: ['ch3', 'ch7']
  },
  {
    id: 'art4',
    title: 'BC\'s Most Secluded A-Frame Cabins',
    titleFr: 'Les cabines A-frame les plus isolées de C.-B.',
    category: 'British Columbia',
    categoryFr: 'Colombie-Britannique',
    readTime: 10,
    date: '2026-04-19',
    dateFr: '19 avril 2026',
    excerpt: 'A-frame cabins are having a moment. Here are the most beautiful and remote ones in British Columbia.',
    excerptFr: 'Les cabines A-frame sont incontournables. Voici les plus belles et isolées de Colombie-Britannique.',
    image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Jordan Pike',
      role: 'West Coast Explorer',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45e1d?auto=format&fit=crop&w=200&q=80'
    },
    intro: 'British Columbia\'s coastline and mountains hide some of the most architecturally stunning A-frame cabins in the world. Here are our top picks for a truly off-grid experience.',
    chaletIds: ['ch5']
  }
];

export const destinations = {
  ontario: {
    id: 'ontario',
    name: 'Ontario',
    nameFr: 'Ontario',
    tagline: 'Land of a Thousand Lakes',
    taglineFr: 'Le pays des mille lacs',
    heroImage: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=1600&q=80',
    intro: 'Ontario is Canada\'s cottage country heartland. From the iconic Muskoka region to the vast wilderness of Algonquin Provincial Park, Ontario offers an unmatched variety of waterfront chalets and lakeside retreats. Whether you\'re seeking a summer swimming paradise or a cozy winter cabin, Ontario delivers.',
    introFr: 'L\'Ontario est le cœur du pays du chalet au Canada. De l\'emblématique région de Muskoka à la vaste nature du parc provincial Algonquin, l\'Ontario offre une variété inégalée de chalets bord de l\'eau et de retraites lacustres.',
    features: [
      { icon: 'waves', title: '3,000+ Lakes', titleFr: 'Plus de 3 000 lacs', desc: 'Endless waterfront options from small ponds to the Great Lakes.' },
      { icon: 'trees', title: 'Old-Growth Forests', titleFr: 'Forêts anciennes', desc: 'Hike through ancient pine forests in Algonquin and beyond.' },
      { icon: 'star', title: 'Dark Sky Preserves', titleFr: 'Ciel étoilé', desc: 'World-class stargazing at Torrance Barrens and Point Pelee.' },
      { icon: 'snowflake', title: 'Four Seasons', titleFr: 'Quatre saisons', desc: 'From summer swimming to winter ice fishing and skiing.' }
    ],
    faq: [
      { q: 'When is the best time to visit Ontario for a chalet stay?', qFr: 'Quand visiter l\'Ontario pour un séjour en chalet ?', a: 'Summer (June–August) is peak season for lake activities. Fall (September–October) offers spectacular foliage. Winter is ideal for skiing and ice activities near Blue Mountain and Muskoka.', aFr: 'L\'été (juin–août) est la saison idéale pour les activités lacustres. L\'automne offre un feuillage spectaculaire. L\'hiver est idéal pour le ski près de Blue Mountain et Muskoka.' },
      { q: 'Do I need a park permit for Algonquin?', qFr: 'Faut-il un permis pour Algonquin ?', a: 'Yes, day-use permits are required for Algonquin Provincial Park. If your chalet is inside the park, your host will provide details. Book permits in advance during peak season.', aFr: 'Oui, des permis d\'utilisation journalière sont requis pour le parc provincial Algonquin. Réservez à l\'avance pendant la haute saison.' },
      { q: 'Are chalets pet-friendly?', qFr: 'Les chalets acceptent-ils les animaux ?', a: 'Many Ontario chalets welcome pets. Use the filter on VRBO or check individual listings for pet policies and any associated fees.', aFr: 'De nombreux chalets en Ontario acceptent les animaux. Utilisez le filtre sur VRBO ou vérifiez chaque annonce.' },
      { q: 'How far is Muskoka from Toronto?', qFr: 'Muskoka est-il loin de Toronto ?', a: 'Muskoka is approximately 2 hours by car from Toronto, making it a perfect weekend getaway destination.', aFr: 'Muskoka se trouve à environ 2 heures de route de Toronto, ce qui en fait une escapade de week-end parfaite.' }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ]
  },
  quebec: {
    id: 'quebec',
    name: 'Quebec',
    nameFr: 'Québec',
    tagline: 'European Charm, Wild Nature',
    taglineFr: 'Charme européen, nature sauvage',
    heroImage: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80',
    intro: 'Quebec blends European-style charm with untamed Canadian wilderness. The Laurentians and Mont-Tremblant regions offer world-class ski-in/ski-out chalets, while the Eastern Townships hide pastoral retreats. Experience French-Canadian hospitality, poutine by the fire, and some of the best fall foliage in the world.',
    introFr: 'Le Québec mêle charme à l\'européenne et nature sauvage canadienne. Les Laurentides et Mont-Tremblant offrent des chalets ski-in/ski-out de classe mondiale, tandis que les Cantons-de-l\'Est cachent des retraites pastorales.',
    features: [
      { icon: 'mountain', title: 'Mont-Tremblant', titleFr: 'Mont-Tremblant', desc: 'Premier ski resort in Eastern Canada with alpine village charm.' },
      { icon: 'leaf', title: 'Fall Foliage', titleFr: 'Feuillage d\'automne', desc: 'Spectacular colors in the Laurentians from late September to October.' },
      { icon: 'snowflake', title: 'Winter Carnival', titleFr: 'Carnaval d\'hiver', desc: 'Quebec Winter Festival — the world\'s largest winter celebration.' },
      { icon: 'home', title: 'Heritage Architecture', titleFr: 'Architecture patrimoniale', desc: 'Centuries-old stone buildings and cozy log chalets.' }
    ],
    faq: [
      { q: 'Do I need to speak French?', qFr: 'Faut-il parler français ?', a: 'While French is the official language, most chalet hosts and tourism operators in popular areas speak English. A few French phrases are always appreciated!', aFr: 'Bien que le français soit la langue officielle, la plupart des hôtes et opérateurs touristiques parlent anglais dans les zones populaires.' },
      { q: 'Is Mont-Tremblant good for beginners?', qFr: 'Mont-Tremblant convient-il aux débutants ?', a: 'Absolutely — Tremblant has excellent beginner and intermediate trails, plus ski schools with multilingual instructors.', aFr: 'Absolument — Tremblant a d\'excellentes pistes pour débutants et intermédiaires, plus des écoles de ski multilingues.' },
      { q: 'What\'s the best region for a summer chalet stay?', qFr: 'Quelle est la meilleure région pour un séjour d\'été ?', a: 'The Laurentians and Eastern Townships (Cantons-de-l\'Est) are ideal for summer, offering lakes, hiking, and charming villages.', aFr: 'Les Laurentides et les Cantons-de-l\'Est sont idéaux pour l\'été, offrant lacs, randonnées et villages charmants.' },
      { q: 'How far is Mont-Tremblant from Montreal?', qFr: 'Mont-Tremblant est-il loin de Montréal ?', a: 'Mont-Tremblant is about 1.5 hours by car from Montreal along scenic Highway 15 North.', aFr: 'Mont-Tremblant se trouve à environ 1h30 de route de Montréal sur la route panoramique 15 Nord.' }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1444156239938-8b19a8b50c1f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  britishColumbia: {
    id: 'britishColumbia',
    name: 'British Columbia',
    nameFr: 'Colombie-Britannique',
    tagline: 'Where Mountains Meet the Sea',
    taglineFr: 'Où les montagnes rencontrent la mer',
    heroImage: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=1600&q=80',
    intro: 'British Columbia is Canada\'s adventure capital. From the world-famous slopes of Whistler to the rugged coastline of Tofino and the vineyards of the Okanagan, BC offers chalets for every season and every dream. Expect old-growth forests, ocean views, and the Northern Lights.',
    introFr: 'La Colombie-Britannique est la capitale de l\'aventure au Canada. Des pentes mondialement connues de Whistler à la côte accidentée de Tofino, la C.-B. offre des chalets pour toutes les saisons.',
    features: [
      { icon: 'mountain', title: 'Whistler Blackcomb', titleFr: 'Whistler Blackcomb', desc: 'North America\'s largest ski resort with ski-in/ski-out chalets.' },
      { icon: 'waves', title: 'Pacific Coast', titleFr: 'Côte du Pacifique', desc: 'Oceanfront chalets in Tofino and the Sunshine Coast.' },
      { icon: 'star', title: 'Northern Lights', titleFr: 'Aurores boréales', desc: 'Aurora viewing in northern BC during winter months.' },
      { icon: 'leaf', title: 'Okanagan Wine', titleFr: 'Vignobles d\'Okanagan', desc: 'Vineyard-adjacent chalets in Canada\'s wine country.' }
    ],
    faq: [
      { q: 'When can I see the Northern Lights in BC?', qFr: 'Quand voir les aurores boréales en C.-B. ?', a: 'The best time is from September to March in northern BC regions like Muncho Lake and the Stewart area. Whistler also occasionally gets displays during strong solar activity.', aFr: 'La meilleure période va de septembre à mars dans le nord de la C.-B. Whistler reçoit aussi occasionnellement des aurores.' },
      { q: 'Is Tofino worth visiting in winter?', qFr: 'Tofino vaut-il le détour en hiver ?', a: 'Absolutely — winter in Tofino is famous for storm watching. Many chalets are designed with floor-to-ceiling windows specifically for this experience.', aFr: 'Absolument — l\'hiver à Tofino est célèbre pour l\'observation des tempêtes. De nombreux chalets sont conçus avec de grandes baies vitrées.' },
      { q: 'Do I need a car in Whistler?', qFr: 'Faut-il une voiture à Whistler ?', a: 'If your chalet is in the main village, you can manage without a car. For chalets in the backcountry or surrounding areas, a vehicle is recommended.', aFr: 'Si votre chalet est dans le village principal, vous pouvez vous passer de voiture. Sinon, un véhicule est recommandé.' },
      { q: 'What\'s the best season for the Okanagan?', qFr: 'Quelle est la meilleure saison pour l\'Okanagan ?', a: 'Summer and early fall (July–October) are ideal for wine tasting, lake activities, and warm weather. Many chalets have private vineyard views.', aFr: 'L\'été et le début de l\'automne (juillet–octobre) sont idéals pour la dégustation de vin et les activités lacustres.' }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1444156239938-8b19a8b50c1f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  alberta: {
    id: 'alberta',
    name: 'Alberta',
    nameFr: 'Alberta',
    tagline: 'Rocky Mountain Majesty',
    taglineFr: 'La majesté des Rocheuses',
    heroImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=80',
    intro: 'Alberta is home to the Canadian Rockies\' most iconic destinations. Banff, Canmore, and Jasper offer chalets with jaw-dropping mountain views, glacier-fed lakes, and access to some of the world\'s best hiking and skiing. This is where luxury meets wilderness.',
    introFr: 'L\'Alberta abrite les destinations les plus emblématiques des Rocheuses canadiennes. Banff, Canmore et Jasper offrent des chalets avec vues spectaculaires sur les montagnes.',
    features: [
      { icon: 'mountain', title: 'Banff National Park', titleFr: 'Parc national de Banff', desc: 'Canada\'s first national park with world-class chalet stays.' },
      { icon: 'waves', title: 'Glacier Lakes', titleFr: 'Lacs glaciaires', desc: 'Turquoise waters of Lake Louise and Moraine Lake.' },
      { icon: 'snowflake', title: 'World-Class Skiing', titleFr: 'Ski de classe mondiale', desc: 'Sunshine Village and Lake Louise ski resorts.' },
      { icon: 'star', title: 'Wildlife Watching', titleFr: 'Observation de la faune', desc: 'Elk, bears, and bighorn sheep are commonly spotted.' }
    ],
    faq: [
      { q: 'Do I need a national park pass?', qFr: 'Faut-il un pass de parc national ?', a: 'Yes, a Parks Canada Discovery Pass or day pass is required for Banff, Jasper, and other national parks. Many chalet hosts include this information at check-in.', aFr: 'Oui, un pass Découverte de Parcs Canada ou un pass journalier est requis pour Banff, Jasper et d\'autres parcs nationaux.' },
      { q: 'When is the best time to visit Banff?', qFr: 'Quand visiter Banff ?', a: 'Summer (June–September) for hiking and lake activities. Winter (December–March) for skiing. September offers fewer crowds and stunning larch colors.', aFr: 'L\'été (juin–septembre) pour la randonnée. L\'hiver (décembre–mars) pour le ski. Septembre offre moins de monde et des couleurs superbes.' },
      { q: 'Are there hot springs near Banff chalets?', qFr: 'Y a-t-il des sources thermales près de Banff ?', a: 'Yes, the Banff Upper Hot Springs are open year-round and just minutes from downtown. Some luxury chalets also feature private hot tubs with mountain views.', aFr: 'Oui, les sources thermales de Banff sont ouvertes toute l\'année. Certains chalets de luxe ont aussi des spas privés avec vue sur les montagnes.' },
      { q: 'Is it safe to hike in bear country?', qFr: 'Est-il sûr de randonner en territoire d\'ours ?', a: 'Yes, with precautions: carry bear spray, hike in groups, make noise, and stay on marked trails. Many chalet hosts provide bear spray and safety information.', aFr: 'Oui, avec des précautions : portez du spray anti-ours, marchez en groupe, faites du bruit et restez sur les sentiers marqués.' }
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1444156239938-8b19a8b50c1f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=800&q=80'
    ]
  }
};

// Simulated weather data
export const weatherData = {
  muskoka: {
    location: 'Muskoka',
    locationFr: 'Muskoka',
    temp: 18,
    condition: 'partlyCloudy',
    feelsLike: 16,
    humidity: 62,
    wind: 12
  },
  tremblant: {
    location: 'Mont-Tremblant',
    locationFr: 'Mont-Tremblant',
    temp: 15,
    condition: 'sunny',
    feelsLike: 14,
    humidity: 55,
    wind: 8
  }
};

export const allProvinces = ['ontario', 'quebec', 'britishColumbia', 'alberta'];