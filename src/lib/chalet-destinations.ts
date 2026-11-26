//Destinations ChaletExpress — extrait de scripts/seed-cottages.mjs (44 entrées).
//Aucun import @/ : ce module est utilisable depuis les scripts Node.

export const DESTINATIONS: { slug: string; province: string; query: string; hl?: string }[] = [
  // Ontario
  { slug: 'muskoka',            province: 'ontario',          query: 'muskoka cottage rentals ontario canada' },
  { slug: 'kawarthas',          province: 'ontario',          query: 'kawartha lakes ontario cottage vrbo' },
  { slug: 'haliburton',         province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',       province: 'ontario',          query: 'georgian bay cottage rentals ontario canada' },
  { slug: 'prince-edward',      province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },

// FR — court et précis
{ slug: 'laurentides',    province: 'quebec', query: 'chalet laurentides',    hl: 'fr' },
{ slug: 'mont-tremblant', province: 'quebec', query: 'chalet mont-tremblant', hl: 'fr' },
{ slug: 'quebec',         province: 'quebec', query: 'location chalet à louer', hl: 'fr' },

// EN — court et précis
{ slug: 'laurentides',    province: 'quebec', query: 'cottage laurentians',          hl: 'en' },
{ slug: 'mont-tremblant', province: 'quebec', query: 'cottage mont-tremblant rental', hl: 'en' },
{ slug: 'quebec',         province: 'quebec', query: 'vacation cottage rental quebec', hl: 'en' },
{ slug: 'quebec-city',    province: 'quebec', query: 'quebec city vacation rental vrbo canada', hl: 'en' },
{ slug: 'orford',         province: 'quebec', query: 'orford estrie chalet rental vrbo quebec', hl: 'en' },
{ slug: 'bromont',        province: 'quebec', query: 'bromont chalet rental vrbo quebec canada', hl: 'en' },
{ slug: 'magog',          province: 'quebec', query: 'magog lake memphremagog cottage vrbo quebec', hl: 'en' },
{ slug: 'saint-sauveur',  province: 'quebec', query: 'saint sauveur chalet rental vrbo laurentians', hl: 'en' },
{ slug: 'ste-adele',      province: 'quebec', query: 'sainte adele chalet rental vrbo laurentians', hl: 'en' },
{ slug: 'morin-heights',  province: 'quebec', query: 'morin heights chalet rental vrbo quebec', hl: 'en' },
{ slug: 'sutton',         province: 'quebec', query: 'sutton quebec chalet rental vrbo canada', hl: 'en' },

  // British Columbia
  { slug: 'whistler',           province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',           province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'sunshine-coast',     province: 'british-columbia', query: 'gibsons bc cabin rental vrbo' },
  { slug: 'tofino',             province: 'british-columbia', query: 'tofino bc cabin rental canada' },

  // Nova Scotia
  { slug: 'cape-breton',        province: 'nova-scotia',      query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns',     province: 'nova-scotia',      query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'digby',              province: 'nova-scotia',      query: 'digby nova scotia cottage rental canada' },
  { slug: 'yarmouth-ns',        province: 'nova-scotia',      query: 'yarmouth nova scotia cottage rental canada' },

  // Alberta
  { slug: 'sylvan-lake',        province: 'alberta',          query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'pigeon-lake',        province: 'alberta',          query: 'pigeon lake cottage alberta canada' },
  { slug: 'gull-lake-ab',       province: 'alberta',          query: 'gull lake cottage rental alberta canada' },

  // New Brunswick
  { slug: 'acadian-peninsula',  province: 'new-brunswick',    query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'shediac',            province: 'new-brunswick',    query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'fundy-coast',        province: 'new-brunswick',    query: 'bay of fundy cottage rental new brunswick' },
  { slug: 'st-andrews',         province: 'new-brunswick',    query: 'st andrews nb cottage rental canada' },
  { slug: 'sussex-nb',          province: 'new-brunswick',    query: 'sussex new brunswick cottage rental' },
  { slug: 'moncton-nb',         province: 'new-brunswick',    query: 'moncton new brunswick cottage rental canada' },

  // PEI
  { slug: 'pei-north-shore',    province: 'pei',              query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east',    province: 'pei',              query: 'points east cottage rentals pei canada' },
  { slug: 'charlottetown',      province: 'pei',              query: 'charlottetown pei cottage rental canada' },
  { slug: 'victoria-pei',       province: 'pei',              query: 'victoria pei cottage rental canada' },

  // Saskatchewan
  { slug: 'candle-lake',        province: 'saskatchewan',     query: 'candle lake cottage rental saskatchewan' },

  // Manitoba
  { slug: 'falcon-lake',        province: 'manitoba',         query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'gimli',              province: 'manitoba',         query: 'gimli cottage rental manitoba canada' },
  { slug: 'lake-winnipeg',      province: 'manitoba',         query: 'lake winnipeg cottage rental manitoba canada' },
]
