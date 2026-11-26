//Destinations ChaletExpress — extrait de scripts/seed-cottages.mjs (44 entrées).
//Aucun import @/ : ce module est utilisable depuis les scripts Node.

export const DESTINATIONS: { slug: string; province: string; query: string; hl?: string }[] = [
  // Ontario — 6
  { slug: 'muskoka',         province: 'ontario',          query: 'muskoka cottage rentals ontario canada' },
  { slug: 'prince-edward',   province: 'ontario',          query: 'prince edward county cottage rentals ontario canada' },
  { slug: 'blue-mountain',   province: 'ontario',          query: 'blue mountain cottage rentals ontario canada' },
  { slug: 'haliburton',      province: 'ontario',          query: 'haliburton highlands cottage rentals ontario canada' },
  { slug: 'georgian-bay',    province: 'ontario',          query: 'georgian bay cottage rentals ontario canada' },
  { slug: 'kawarthas',       province: 'ontario',          query: 'kawartha lakes ontario cottage rentals canada' },

  // Quebec — 6 (FR + EN sur les plus demandees)
  { slug: 'quebec',              province: 'quebec', query: 'chalet a louer quebec',            hl: 'fr' },
  { slug: 'mont-tremblant',      province: 'quebec', query: 'chalet mont tremblant',            hl: 'fr' },
  { slug: 'laurentides',         province: 'quebec', query: 'chalet laurentides',               hl: 'fr' },
  { slug: 'charlevoix',          province: 'quebec', query: 'chalet a louer charlevoix',        hl: 'fr' },
  { slug: 'saguenay-lac-st-jean',province: 'quebec', query: 'chalet a louer saguenay lac st jean', hl: 'fr' },
  { slug: 'saguenay-lac-st-jean',province: 'quebec', query: 'saguenay chalet rental quebec', hl: 'en' },
  { slug: 'quebec',              province: 'quebec', query: 'vacation cottage rental quebec',   hl: 'en' },
  { slug: 'mont-tremblant',      province: 'quebec', query: 'cottage mont tremblant rental',    hl: 'en' },
  { slug: 'laurentides',         province: 'quebec', query: 'cottage laurentians',              hl: 'en' },
  { slug: 'magog',               province: 'quebec', query: 'magog lake memphremagog cottage vrbo quebec', hl: 'en' },

  // Colombie-Britannique — 6
  { slug: 'maple-bay',       province: 'british-columbia', query: 'maple bay cabin rentals bc canada' },
  { slug: 'whistler',        province: 'british-columbia', query: 'whistler cabin rentals bc canada' },
  { slug: 'okanagan',        province: 'british-columbia', query: 'okanagan valley cottage rentals bc canada' },
  { slug: 'tofino',          province: 'british-columbia', query: 'tofino bc cabin rental canada' },
  { slug: 'sunshine-coast',  province: 'british-columbia', query: 'gibsons bc cabin rental vrbo' },
  { slug: 'comox-valley',    province: 'british-columbia', query: 'comox valley cabin rentals bc canada' },

  // Alberta — 6
  { slug: 'pigeon-lake',     province: 'alberta', query: 'pigeon lake cottage alberta canada' },
  { slug: 'crowsnest-pass',  province: 'alberta', query: 'crowsnest pass cabin rentals alberta canada' },
  { slug: 'sylvan-lake',     province: 'alberta', query: 'sylvan lake cottage rentals alberta canada' },
  { slug: 'gull-lake',       province: 'alberta', query: 'gull lake cottage rental alberta canada' },
  { slug: 'gull-lake',       province: 'alberta', query: 'gull lake alberta vacation rental' },
  { slug: 'jasper',          province: 'alberta', query: 'jasper cabin rentals alberta canada' },
  { slug: 'jasper',          province: 'alberta', query: 'jasper vacation rental alberta' },
  { slug: 'banff',           province: 'alberta', query: 'banff cabin rentals alberta canada' },
  { slug: 'banff',           province: 'alberta', query: 'banff vacation rental alberta' },

  // Manitoba — 6
  { slug: 'falcon-lake',     province: 'manitoba', query: 'falcon lake cottage rentals manitoba canada' },
  { slug: 'gimli',           province: 'manitoba', query: 'gimli cottage rental manitoba canada' },
  { slug: 'whiteshell',      province: 'manitoba', query: 'whiteshell provincial park cabin rentals manitoba' },
  { slug: 'lake-winnipeg',   province: 'manitoba', query: 'lake winnipeg cottage rental manitoba canada' },
  { slug: 'winnipeg-beach',  province: 'manitoba', query: 'winnipeg beach cottage rental manitoba canada' },
  { slug: 'clear-lake',      province: 'manitoba', query: 'clear lake cottage rental manitoba canada' },

  // Saskatchewan — 6
  { slug: 'candle-lake',     province: 'saskatchewan', query: 'candle lake cottage rental saskatchewan' },
  { slug: 'meadow-lake',     province: 'saskatchewan', query: 'meadow lake saskatchewan cabin rental' },
  { slug: 'emma-lake',       province: 'saskatchewan', query: 'emma lake cabin rentals saskatchewan' },
  { slug: 'last-mountain',   province: 'saskatchewan', query: 'last mountain lake saskatchewan cottage rental' },
  { slug: 'greenwater-lake', province: 'saskatchewan', query: 'greenwater lake cabin rentals saskatchewan' },
  { slug: 'la-ronge',        province: 'saskatchewan', query: 'la ronge cabin rentals saskatchewan' },
  { slug: 'la-ronge',        province: 'saskatchewan', query: 'la ronge saskatchewan vacation rental' },

  // Nouveau-Brunswick — 6
  { slug: 'shediac',           province: 'new-brunswick', query: 'shediac cottage rentals new brunswick canada' },
  { slug: 'fundy-coast',       province: 'new-brunswick', query: 'bay of fundy cottage rental new brunswick' },
  { slug: 'acadian-peninsula', province: 'new-brunswick', query: 'acadian peninsula cottage rentals new brunswick canada' },
  { slug: 'st-andrews',        province: 'new-brunswick', query: 'st andrews nb cottage rental canada' },
  { slug: 'moncton-nb',        province: 'new-brunswick', query: 'moncton new brunswick cottage rental canada' },
  { slug: 'miramichi',         province: 'new-brunswick', query: 'miramichi cottage rentals new brunswick canada' },

  // Nouvelle-Ecosse — 6
  { slug: 'cape-breton',    province: 'nova-scotia', query: 'cape breton cottage rentals nova scotia canada' },
  { slug: 'south-shore-ns', province: 'nova-scotia', query: 'south shore cottage rentals nova scotia canada' },
  { slug: 'digby',          province: 'nova-scotia', query: 'digby nova scotia cottage rental canada' },
  { slug: 'yarmouth-ns',    province: 'nova-scotia', query: 'yarmouth nova scotia cottage rental canada' },
  { slug: 'lunenburg',      province: 'nova-scotia', query: 'lunenburg nova scotia cottage rentals canada' },
  { slug: 'annapolis-valley',province: 'nova-scotia', query: 'annapolis valley cottage rentals nova scotia' },

  // PEI — 6
  { slug: 'charlottetown',   province: 'pei', query: 'charlottetown pei cottage rental canada' },
  { slug: 'pei-north-shore', province: 'pei', query: 'north shore cottage rentals pei canada' },
  { slug: 'pei-points-east', province: 'pei', query: 'points east cottage rentals pei canada' },
  { slug: 'victoria-pei',    province: 'pei', query: 'victoria pei cottage rental canada' },
  { slug: 'cavendish',       province: 'pei', query: 'cavendish pei cottage rentals canada' },
  { slug: 'summerside',      province: 'pei', query: 'summerside pei cottage rentals canada' },
]
