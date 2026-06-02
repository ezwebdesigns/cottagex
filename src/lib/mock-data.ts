export const initialDestinations = [
  { id: 1, name: 'Muskoka, ON', properties: '320+ cottages', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'Mont-Tremblant, QC', properties: '450+ cottages', image: 'https://images.unsplash.com/photo-1517770413964-df8ca61194a6?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Banff, AB', properties: '180+ cottages', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Charlevoix, QC', properties: '210+ cottages', image: 'https://images.unsplash.com/photo-1502672260266-1c1e52504437?auto=format&fit=crop&q=80&w=600' },
];

export const initialProperties = [
  { id: 1, title: 'Rustic Lakefront Cabin', location: 'Muskoka, Ontario', province: 'Ontario', price: '250', rating: '4.9', reviews: 128, image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=600', tag: 'Lakefront', isLiked: true, description: 'A beautiful peaceful haven located directly on the pristine shores of Muskoka. Ideal for catching golden sunsets and canoeing.' },
  { id: 2, title: 'Modern Alpine Refuge', location: 'Mont-Tremblant, Quebec', province: 'Quebec', price: '320', rating: '5.0', reviews: 84, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600', tag: 'Popular', isLiked: false, description: 'Nestled just minutes from ski slopes, this contemporary refuge features a grand stone fireplace and outdoor hot tub.' },
  { id: 3, title: 'Eco-Cabin in the Wild Woods', location: 'Tofino, British Columbia', province: 'British Columbia', price: '180', rating: '4.8', reviews: 56, image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=600', tag: 'Secluded', isLiked: false, description: 'Experience complete off-grid disconnect surrounded by the ancient towering giants of the West Coast.' },
  { id: 4, title: 'Luxury Estate with Private Spa', location: 'Whistler, British Columbia', province: 'British Columbia', price: '550', rating: '4.9', reviews: 210, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', tag: 'Luxury', isLiked: true, description: 'An exceptional custom lodge offering expansive glass facades, a private built-in spa, and mountain views.' },
  { id: 5, title: 'The Sunset Retreat - Haliburton', location: 'Haliburton, Ontario', province: 'Ontario', price: '290', rating: '4.7', reviews: 42, image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600', tag: 'Lakefront', isLiked: false, description: 'Perfect for family reunions. This spacious cottage offers a private sandy beach shore and wide barbecue deck.' },
  { id: 6, title: 'Modern Trapper Cabin', location: 'Bruce Peninsula, Ontario', province: 'Ontario', price: '210', rating: '4.9', reviews: 73, image: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=600', tag: 'Secluded', isLiked: true, description: 'Surrounded by the legendary hiking trails of Bruce Peninsula. Features a traditional log framework with upscale amenities.' }
];

export const ontarioListicleChalets = [
  { id: 'l1', rank: 1, title: 'The Blue Pines Sanctuary (Muskoka)', description: 'An architectural marvel crafted completely in white cedar, boasting a massive 50-foot private dock, an integrated historic boathouse lounge, and direct deep-water access to Muskoka\'s premier lakes.', rating: '4.97', price: '450', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=600', vibe: 'Prestige & Heritage', vrboLink: 'https://www.vrbo.com/search/keywords:muskoka-ontario-canada' },
  { id: 'l2', rank: 2, title: 'The Borealis A-Frame (Algonquin)', description: 'A beautifully reimagined mid-century A-frame right on the border of Algonquin Provincial Park. Highlights include a dramatic suspended hammock net over the light-flooded living space.', rating: '4.92', price: '210', image: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&q=80&w=600', vibe: 'Minimalist Design', vrboLink: 'https://www.vrbo.com/search/keywords:algonquin-park-ontario-canada' },
  { id: 'l3', rank: 3, title: 'The Bruce Peninsula Cliffside Villa', description: 'Perched dramatic high above the deep turquoise waters of Georgian Bay, this luxury villa features an infinity-edge hot tub built into a multi-tiered wrap-around cedar deck.', rating: '4.89', price: '580', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600', vibe: 'Contemporary Luxury', vrboLink: 'https://www.vrbo.com/search/keywords:bruce-peninsula-ontario' },
  { id: 'l4', rank: 4, title: 'The Secret Haven of Tobermory', description: 'Hidden peacefully away in a forest of ancient silver birch trees, this eco-sensitive cottage offers a pebble beach cove perfect for launching kayaks at sunrise.', rating: '4.85', price: '195', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=600', vibe: 'Eco-Friendly Sanctuary', vrboLink: 'https://www.vrbo.com/search/keywords:tobermory-ontario' },
  { id: 'l5', rank: 5, title: 'Whispering Highlands Log Cabin (Haliburton)', description: 'A quintessential hand-scribed log home modernized with premium Scandinavian interiors. Features a custom stone fire pit carved directly into the Canadian Shield granite.', rating: '4.91', price: '275', image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80&w=600', vibe: 'Cozy & Family-focused', vrboLink: 'https://www.vrbo.com/search/keywords:haliburton-ontario' },
  { id: 'l6', rank: 6, title: 'The Sandbanks Duneside Villa', description: 'An elegant glass-walled architectural home steps away from the majestic white sand dunes of Sandbanks. Outfitted with minimalist Nordic style and premium linen.', rating: '4.95', price: '490', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600', vibe: 'Beachside Chic', vrboLink: 'https://www.vrbo.com/search/keywords:prince-edward-county-ontario' },
  { id: 'l7', rank: 7, title: 'The Hidden Stream Mill (Kawarthas)', description: 'A restored 19th-century watermill intersected by a tranquil trout stream. Exposed original beams combine with state-of-the-art automation to create a romantic retreat.', rating: '4.88', price: '310', image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=600', vibe: 'Historical Romance', vrboLink: 'https://www.vrbo.com/search/keywords:kawartha-lakes-ontario' }
];

export const initialArticles = [
  { id: 101, title: '7 Most Beautiful Cottages in Ontario for the Ultimate Escape', excerpt: 'From Muskoka estates to Bruce Peninsula cliffhangers, explore our curated ranking of Ontario\'s 7 most spectacular wilderness and lakeside retreats.', date: 'May 24, 2026', readTime: '10 min read', category: 'Prestige Selection', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800', isListicle: true, slug: '7-most-beautiful-cottages-ontario', content: `Ontario holds some of the most breathtaking nature escapes in North America. Whether you dream of watching misty mornings from a massive lakeside dock or drinking cocoa next to a custom stone fireplace, the province has a sanctuary built just for you.\n\nWe have evaluated dozens of properties on design, privacy, and waterfront premium quality to bring you the ultimate list of 7 exceptional cottages to book through our trusted partners.` },
  { id: 1, title: 'Top 5 Regions to Rent a Cottage in Ontario This Fall', excerpt: 'Watch Ontario ignite in spectacular hues of gold, amber, and deep scarlet from late September to late October. Discover our absolute favorite regions.', date: 'September 12, 2025', readTime: '6 min read', category: 'Destinations', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', isListicle: false, slug: 'top-5-regions-ontario-fall', content: `Autumn is arguably the most magical season to escape to a Canadian cottage. Forest canopies transform into vivid canvases of gold and scarlet, offering breathtaking backdrops for hiking or lakeside relaxing.\n\nHere are our recommended fall destinations:\n\n- Muskoka: Renowned worldwide for luxury cottaging, Muskoka is quiet and beautiful in the fall. Glass-like lakes mirror the stunning forest foliage.\n- Bruce Peninsula: Rugged limestone cliffs hovering over turquoise water. Fall is the absolute best time to hike without summer crowds.` },
  { id: 2, title: 'How to Choose the Perfect Waterfront Cottage in Canada', excerpt: 'Private docks, included watercraft, sunset orientation, and sandy entry. Read our essential checklist for an amazing, worry-free stay.', date: 'August 28, 2025', readTime: '8 min read', category: 'Practical Advice', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800', isListicle: false, slug: 'choose-perfect-waterfront-cottage', content: `Renting a waterfront cottage is a time-honored Canadian summer tradition. However, not all waterfronts are created equal. To ensure your vacation is perfectly tailored, consider these key criteria.\n\nWaterfront Access: Is it sandy or rocky?\nSome listings mention "water access," but it could mean a steep cliff or weedy, muddy shores. If you travel with young children, a gradual sandy beach entry is vital.\n\nSunset or Sunrise Orientation:\n- East-Facing (Sunrise): Beautiful bright mornings, perfect for early risers.\n- West-Facing (Sunset): Keeps your deck sunny all afternoon, ending with glowing skylines.` }
];

const provinceSearch = (p: string) => ({
  categories: [
    `Luxury Cottages in ${p}`,
    `Pet Friendly Cottages in ${p}`,
    `Family Cottage Resort in ${p}`,
    `Lakefront Cottage in ${p}`,
    `Cottage with Hot Tub in ${p}`,
    `Romantic Cottage for 2 in ${p}`,
  ],
  more: [
    `Cottage Rentals in ${p}`,
    `Chalet for Rent in ${p}`,
    `Cabin for Rent in ${p}`,
    `Waterfront Cottage in ${p}`,
    `Log Wood Cottage in ${p}`,
    `Mountain Cottage in ${p}`,
  ],
});

export const canadaSearchData = [
  { city: 'Ontario', ...provinceSearch('Ontario') },
  { city: 'Quebec', ...provinceSearch('Quebec') },
  { city: 'British Columbia', ...provinceSearch('British Columbia') },
  { city: 'New Brunswick', ...provinceSearch('New Brunswick') },
  { city: 'Alberta', ...provinceSearch('Alberta') },
  { city: 'Nova Scotia', ...provinceSearch('Nova Scotia') },
  { city: 'Manitoba', ...provinceSearch('Manitoba') },
  { city: 'Saskatchewan', ...provinceSearch('Saskatchewan') },
];

const citySearch = (c: string) => ({
  categories: [
    `Luxury Cottages in ${c}`,
    `Pet Friendly Cottages in ${c}`,
    `Family Cottage Resort in ${c}`,
    `Lakefront Cottage in ${c}`,
    `Cottage with Hot Tub in ${c}`,
    `Romantic Cottage for 2 in ${c}`,
  ],
  more: [
    `Cottage Rentals in ${c}`,
    `Chalet for Rent in ${c}`,
    `Cabin for Rent in ${c}`,
    `Waterfront Cottage in ${c}`,
    `Log Wood Cottage in ${c}`,
    `Mountain Cottage in ${c}`,
  ],
});

export const ontarioSearchData = [
  { city: 'Muskoka', ...citySearch('Muskoka') },
  { city: 'Haliburton', ...citySearch('Haliburton') },
  { city: 'The Kawarthas', ...citySearch('the Kawarthas') },
  { city: 'Georgian Bay', ...citySearch('Georgian Bay') },
  { city: 'Ottawa Valley', ...citySearch('Ottawa Valley') },
  { city: 'Rideau Lakes', ...citySearch('Rideau Lakes') },
  { city: 'Prince Edward County', ...citySearch('Prince Edward County') },
  { city: 'Algonquin Highlands', ...citySearch('Algonquin') },
];

export const quebecSearchData = [
  { city: 'The Laurentians', ...citySearch('the Laurentians') },
  { city: 'Eastern Townships', ...citySearch('Eastern Townships') },
  { city: 'Charlevoix', ...citySearch('Charlevoix') },
  { city: 'Lanaudière', ...citySearch('Lanaudière') },
  { city: 'Québec City', ...citySearch('Québec City') },
  { city: 'Mont-Tremblant', ...citySearch('Mont-Tremblant') },
  { city: 'Gaspé', ...citySearch('Gaspé') },
  { city: 'Saguenay', ...citySearch('Saguenay') },
];

export const novaScotiaSearchData = [
  { city: 'Cape Breton', ...citySearch('Cape Breton') },
  { city: 'South Shore', ...citySearch('South Shore') },
  { city: 'Halifax', ...citySearch('Halifax') },
  { city: 'Lunenburg', ...citySearch('Lunenburg') },
  { city: 'Annapolis Valley', ...citySearch('Annapolis Valley') },
  { city: 'Peggy\'s Cove', ...citySearch('Peggy\'s Cove') },
  { city: 'Wolfville', ...citySearch('Wolfville') },
  { city: 'Digby', ...citySearch('Digby') },
];

export const britishColumbiaSearchData = [
  { city: 'Okanagan Valley', ...citySearch('Okanagan Valley') },
  { city: 'Sunshine Coast', ...citySearch('Sunshine Coast') },
  { city: 'Vancouver Island', ...citySearch('Vancouver Island') },
  { city: 'Whistler', ...citySearch('Whistler') },
  { city: 'Tofino', ...citySearch('Tofino') },
  { city: 'Victoria', ...citySearch('Victoria') },
  { city: 'Kelowna', ...citySearch('Kelowna') },
  { city: 'Squamish', ...citySearch('Squamish') },
];

export const newBrunswickSearchData = [
  { city: 'Acadian Peninsula', ...citySearch('Acadian Peninsula') },
  { city: 'Shediac', ...citySearch('Shediac') },
  { city: 'Saint John', ...citySearch('Saint John') },
  { city: 'Fredericton', ...citySearch('Fredericton') },
  { city: 'Moncton', ...citySearch('Moncton') },
  { city: 'Fundy National Park', ...citySearch('Fundy National Park') },
  { city: 'St. Andrews', ...citySearch('St. Andrews') },
  { city: 'Miramichi', ...citySearch('Miramichi') },
];

export const albertaSearchData = [
  { city: 'Canmore & Kananaskis', ...citySearch('Canmore & Kananaskis') },
  { city: 'Sylvan Lake & Pigeon Lake', ...citySearch('Sylvan Lake & Pigeon Lake') },
  { city: 'Banff', ...citySearch('Banff') },
  { city: 'Jasper', ...citySearch('Jasper') },
  { city: 'Lake Louise', ...citySearch('Lake Louise') },
  { city: 'Calgary', ...citySearch('Calgary') },
  { city: 'Edmonton', ...citySearch('Edmonton') },
  { city: 'Waterton Lakes', ...citySearch('Waterton Lakes') },
];

export const manitobaSearchData = [
  { city: 'Falcon Lake', ...citySearch('Falcon Lake') },
  { city: 'West Hawk Lake', ...citySearch('West Hawk Lake') },
  { city: 'Winnipeg', ...citySearch('Winnipeg') },
  { city: 'Clear Lake', ...citySearch('Clear Lake') },
  { city: 'Lake Winnipeg', ...citySearch('Lake Winnipeg') },
  { city: 'Gimli', ...citySearch('Gimli') },
  { city: 'Whiteshell Provincial Park', ...citySearch('Whiteshell Provincial Park') },
  { city: 'Hecla', ...citySearch('Hecla') },
];

export const peiSearchData = [
  { city: 'North Shore', ...citySearch('North Shore') },
  { city: 'Points East', ...citySearch('Points East') },
  { city: 'Charlottetown', ...citySearch('Charlottetown') },
  { city: 'Cavendish', ...citySearch('Cavendish') },
  { city: 'Prince Edward Island National Park', ...citySearch('Prince Edward Island National Park') },
  { city: 'Summerside', ...citySearch('Summerside') },
  { city: 'Brackley Beach', ...citySearch('Brackley Beach') },
  { city: 'Greenwich', ...citySearch('Greenwich') },
];

export const saskatchewanSearchData = [
  { city: 'Waskesiu Lake', ...citySearch('Waskesiu Lake') },
  { city: 'Regina', ...citySearch('Regina') },
  { city: 'Saskatoon', ...citySearch('Saskatoon') },
  { city: 'Prince Albert National Park', ...citySearch('Prince Albert National Park') },
  { city: 'Lake Diefenbaker', ...citySearch('Lake Diefenbaker') },
  { city: 'Cypress Hills', ...citySearch('Cypress Hills') },
  { city: 'Emma Lake', ...citySearch('Emma Lake') },
  { city: 'Moose Jaw', ...citySearch('Moose Jaw') },
];

export const testimonials = [
  { id: 1, text: "We found the absolute perfect cabin for our autumn getaway in Mont-Tremblant through this directory. The handpicked recommendations made booking on VRBO super simple.", author: "Sophie M.", role: "Traveler", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
  { id: 2, text: "The search filters are incredibly intuitive. We wanted a completely secluded lakefront escape in Ontario, and matched with our dream cottage in under 5 minutes.", author: "Marc-Antoine T.", role: "Explorer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" },
  { id: 3, text: "Exquisite selections! I loved being able to easily compare high-grade cabins for our family ski trip to Banff. Highly recommend this curated platform.", author: "Julie C.", role: "Family Vacationer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" }
];
