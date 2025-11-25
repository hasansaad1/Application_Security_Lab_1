const routePolicies = [
  // --- AUTH ROUTES ---
  {
    pathRegex: /^\/auth\/register\/?$/,
    methods: ['POST'], 
    allowedContentTypes: ['multipart/form-data'],
    auth: false
  },
  {
    pathRegex: /^\/auth\/login\/?$/,
    methods: ['POST'], 
    allowedContentTypes: ['application/json'],
    auth: false
  },
  {
    pathRegex: /^\/auth\/me\/?$/,
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  },
  {
    pathRegex: /^\/auth\/logout\/?$/,
    methods: ['POST'], 
    allowedContentTypes: [],
    auth: false
  },

  // --- LISTINGS ROUTES (Order Matters!) ---
  
  // 1. Specific static sub-paths (Must come before :id)
  {
    pathRegex: /^\/listings\/my\/?$/,
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  },
  {
    pathRegex: /^\/listings\/favorites\/?$/,
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  },

  // 2. Specific deep dynamic paths
  {
    // Matches /listings/owner/123
    pathRegex: /^\/listings\/owner\/[\w-]+\/?$/, 
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  },
  {
    // Matches /listings/123/favorite
    pathRegex: /^\/listings\/[\w-]+\/favorite\/?$/, 
    methods: ['GET', 'POST', 'DELETE'], 
    allowedContentTypes: [],
    auth: true
  },
  {
    // Matches /listings/123/phone
    pathRegex: /^\/listings\/[\w-]+\/phone\/?$/, 
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  },

  // 3. Generic dynamic path (The catch-all for listings)
  {
    // Matches /listings/123 (but NOT /listings/my due to order)
    pathRegex: /^\/listings\/[\w-]+\/?$/, 
    methods: ['GET', 'PUT', 'DELETE'], 
    allowedContentTypes: ['application/json', 'multipart/form-data'],
    auth: true
  },

  // 4. The Root collection
  {
    pathRegex: /^\/listings\/?$/,
    methods: ['GET', 'POST'], 
    allowedContentTypes: ['application/json', 'multipart/form-data'],
    auth: true
  },

  // --- USERS ROUTES ---
  {
    pathRegex: /^\/users\/[\w-]+\/?$/,
    methods: ['GET'], 
    allowedContentTypes: [],
    auth: true
  }
];

module.exports = routePolicies;