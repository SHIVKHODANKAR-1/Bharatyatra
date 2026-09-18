import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { getAllUnifiedItems, filterUnifiedItems, sortUnifiedItems, TRENDING_SEARCHES } from './src/services/searchExploreService';
import { CATEGORY_SHORTCUTS, MOOD_DISCOVERY_OPTIONS } from './src/data/exploreTaxonomy';
import { INITIAL_DESTINATIONS } from './src/data/destinations';
import { INITIAL_HIDDEN_GEMS } from './src/data/hiddenGems';
import { DESTINATION_DETAILS_MAP } from './src/data/destinationsDetailsData';
import { INITIAL_EXPERIENCES } from './src/data/experiences';
import { INITIAL_FOOD_PLACES } from './src/data/foodPlaces';
import { INITIAL_SEASONAL_EVENTS } from './src/data/events';
import { calculateHaversineDistanceKm, getCityCoordinates } from './src/services/geoService';
import { RecommendationService } from './src/services/recommendationService';
import { FeedbackService } from './src/services/feedbackService';
import { RetrievalService } from './src/services/retrievalService';
import { CandidateService } from './src/services/candidateService';
import { UserPreferences } from './src/types/auth';
import { AssistantChatMessage } from './src/types/recommendation';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory server-side search history
  const serverSearchHistory: string[] = [
    'Varanasi Ganga Aarti',
    'Hampi ruins',
    'Monsoon in Munnar',
    'Spiti Valley road trip',
    'Jaipur street food',
  ];

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'Bharat Yatra', timestamp: new Date().toISOString() });
  });

  // 1. GET /api/search
  app.get('/api/search', (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const category = typeof req.query.category === 'string' ? req.query.category : '';
      const type = typeof req.query.type === 'string' ? req.query.type : '';
      const userCity = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';
      const sortBy = (typeof req.query.sort === 'string' ? req.query.sort : 'relevance') as any;
      const budget = typeof req.query.budget === 'string' ? req.query.budget : '';
      const style = typeof req.query.style === 'string' ? req.query.style : '';
      const accessibility = typeof req.query.accessibility === 'string' ? req.query.accessibility : '';
      const radiusKm = req.query.radius ? Number(req.query.radius) : undefined;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

      const allItems = getAllUnifiedItems(userCity);

      const filters: any = {
        searchQuery: q,
        locationScope: radiusKm ? 'custom_radius' : 'all_india',
        customRadiusKm: radiusKm,
        categories: category ? [category] : [],
        budgetBrackets: budget ? [budget] : [],
        travelStyles: style ? [style] : [],
        accessibility: accessibility ? [accessibility] : [],
        weather: [],
        season: [],
        crowdLevel: [],
        foodPreferences: [],
        transportTypes: [],
        experienceIntensity: [],
      };

      let filtered = filterUnifiedItems(allItems, filters);

      if (type) {
        filtered = filtered.filter((i) => i.type === type);
      }

      const sorted = sortUnifiedItems(filtered, sortBy);
      const total = sorted.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;
      const results = sorted.slice(offset, offset + limit);

      // Record query in history if significant
      if (q && q.trim().length >= 2 && !serverSearchHistory.includes(q.trim())) {
        serverSearchHistory.unshift(q.trim());
        if (serverSearchHistory.length > 20) serverSearchHistory.pop();
      }

      res.json({
        results,
        total,
        page,
        limit,
        totalPages,
        userCity,
        sortBy,
      });
    } catch (err: any) {
      console.error('Error in /api/search:', err);
      res.status(500).json({ error: 'Search failed', details: err?.message });
    }
  });

  // 2. GET /api/search/suggestions
  app.get('/api/search/suggestions', (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      if (!q) {
        res.json({
          suggestions: [],
          trending: TRENDING_SEARCHES.slice(0, 5),
          recent: serverSearchHistory.slice(0, 5),
        });
        return;
      }

      const allItems = getAllUnifiedItems();
      const matched = allItems
        .filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.location.city.toLowerCase().includes(q) ||
            i.location.state.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        )
        .slice(0, 8)
        .map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          category: i.category,
          city: i.location.city,
          state: i.location.state,
          imageUrl: i.imageUrl,
          dataClassification: i.dataClassification,
          rating: i.rating,
        }));

      res.json({
        query: q,
        suggestions: matched,
        trending: TRENDING_SEARCHES.filter((t) => t.toLowerCase().includes(q)).slice(0, 3),
      });
    } catch (err: any) {
      console.error('Error in /api/search/suggestions:', err);
      res.status(500).json({ error: 'Suggestions failed' });
    }
  });

  // 3. GET /api/search/history
  app.get('/api/search/history', (_req: Request, res: Response) => {
    res.json({ history: serverSearchHistory, trending: TRENDING_SEARCHES });
  });

  // 4. DELETE /api/search/history
  app.delete('/api/search/history', (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    if (q) {
      const idx = serverSearchHistory.indexOf(q);
      if (idx !== -1) serverSearchHistory.splice(idx, 1);
      res.json({ success: true, history: serverSearchHistory });
    } else {
      serverSearchHistory.length = 0;
      res.json({ success: true, history: [] });
    }
  });

  // 5. GET /api/explore
  app.get('/api/explore', (req: Request, res: Response) => {
    try {
      const userCity = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';
      const allItems = getAllUnifiedItems(userCity);

      const popularNearby = allItems
        .filter((i) => (i.distanceKm ?? 9999) <= 400)
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
        .slice(0, 6);

      const hiddenGems = allItems
        .filter((i) => i.isHiddenGem)
        .slice(0, 6);

      const foodHighlights = allItems
        .filter((i) => i.type === 'food')
        .slice(0, 6);

      const adventureActivities = allItems
        .filter((i) => i.category === 'adventure' || i.category === 'mountains')
        .slice(0, 6);

      const culturalExperiences = allItems
        .filter((i) => i.type === 'experience' || i.category === 'heritage' || i.category === 'spiritual')
        .slice(0, 6);

      const weekendTrips = allItems
        .filter((i) => (i.distanceKm ?? 9999) <= 300 || i.suggestedDuration?.includes('2') || i.suggestedDuration?.includes('Weekend'))
        .slice(0, 6);

      res.json({
        userCity,
        popularNearby,
        hiddenGems,
        foodHighlights,
        adventureActivities,
        culturalExperiences,
        weekendTrips,
      });
    } catch (err: any) {
      console.error('Error in /api/explore:', err);
      res.status(500).json({ error: 'Explore data failed' });
    }
  });

  // 6. GET /api/explore/categories
  app.get('/api/explore/categories', (_req: Request, res: Response) => {
    res.json({ categories: CATEGORY_SHORTCUTS });
  });

  // 7. GET /api/explore/moods
  app.get('/api/explore/moods', (_req: Request, res: Response) => {
    res.json({ moods: MOOD_DISCOVERY_OPTIONS });
  });

  // 8. GET /api/explore/nearby
  app.get('/api/explore/nearby', (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lon = req.query.lng ? Number(req.query.lng) : (req.query.lon ? Number(req.query.lon) : undefined);
      const userCity = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';
      const radiusKm = Number(req.query.radiusKm) || 100;

      const origin = (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon))
        ? { latitude: lat, longitude: lon }
        : getCityCoordinates(userCity);

      const allItems = getAllUnifiedItems(userCity).map((item) => ({
        ...item,
        distanceKm: calculateHaversineDistanceKm(origin.latitude, origin.longitude, item.location.latitude, item.location.longitude),
      }));

      const nearbyItems = allItems
        .filter((i) => (i.distanceKm ?? 9999) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      res.json({
        origin,
        radiusKm,
        total: nearbyItems.length,
        items: nearbyItems,
      });
    } catch (err: any) {
      console.error('Error in /api/explore/nearby:', err);
      res.status(500).json({ error: 'Nearby discovery failed' });
    }
  });

  // 9. GET /api/destinations
  app.get('/api/destinations', (req: Request, res: Response) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
      const region = typeof req.query.region === 'string' ? req.query.region : '';
      const category = typeof req.query.category === 'string' ? req.query.category : '';
      const type = typeof req.query.type === 'string' ? req.query.type : '';
      const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS].map((dest) => {
        const ext = DESTINATION_DETAILS_MAP[dest.id];
        return {
          ...dest,
          destinationType: ext?.destinationType || (dest.category === 'spiritual' ? 'Spiritual' : dest.category === 'nature' ? 'Nature' : 'Heritage'),
          matchExplanation: ext?.matchExplanation || '88% Match — aligns with your cultural travel preferences.',
          matchScore: dest.category === 'spiritual' ? 94 : 91,
          galleryImages: ext?.galleryImages || [dest.imageUrl],
        };
      });

      let filtered = allDests.filter((d) => {
        if (region && d.region !== region) return false;
        if (category && d.category !== category && !d.secondaryCategories.includes(category as any)) return false;
        if (type && d.destinationType !== type) return false;
        if (search) {
          const matchName = d.name.toLowerCase().includes(search);
          const matchState = d.location.state.toLowerCase().includes(search);
          const matchCity = d.location.city.toLowerCase().includes(search);
          if (!matchName && !matchState && !matchCity) return false;
        }
        return true;
      });

      res.json({ total: filtered.length, destinations: filtered });
    } catch (err: any) {
      res.status(500).json({ error: 'Destinations list failed' });
    }
  });

  // 10. GET /api/destinations/:id (Full 19-section detail)
  app.get('/api/destinations/:id', (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
      const baseDest = allDests.find((d) => d.id === id || d.slug === id);

      if (!baseDest) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }

      const ext = DESTINATION_DETAILS_MAP[baseDest.id] || {
        destinationType: 'Heritage',
        galleryImages: [baseDest.imageUrl],
        matchExplanation: '90% Match — recommended based on cultural and scenic significance.',
        whyVisitReasons: [
          {
            title: 'Iconic Regional Heritage',
            explanation: `${baseDest.name} preserves monumental cultural history with exceptional architecture and living traditions.`,
            dimension: 'interests',
            relevanceBadge: 'Primary Match',
          },
          {
            title: 'Balanced Travel Budget',
            explanation: 'Comfortable mid-range accommodations and authentic regional cuisine at accessible pricing.',
            dimension: 'budget',
            relevanceBadge: 'Budget Balanced',
          },
        ],
        thingsToDo: [],
        foodToTry: [],
        howToReach: [],
        localTransport: [],
        accessibilityDetails: {
          wheelchairRamps: 'Information not verified.',
          brailleAudioGuides: 'Information not verified.',
          stepCountCaution: 'Moderate walking required around historical monuments.',
          accessibleTransit: 'Information not verified.',
          isVerified: false,
        },
        safetyInfo: {
          emergencyContacts: [{ service: 'Police Control Room', number: '112' }],
          womenTravelerTips: ['Travel via registered app cabs or tourist counters.'],
          nightSafetyLevel: 'Exercise standard travel caution at night.',
          healthAdvisories: ['Carry drinking water and avoid unverified street ice.'],
        },
        faqs: [],
        reviews: [],
        budgetBreakdown: {
          stayPerNightInr: 1200,
          mealsPerDayInr: 400,
          localTransitPerDayInr: 250,
          sightseeingPerDayInr: 200,
          miscDailyInr: 100,
        },
      };

      const fullDestination = {
        ...baseDest,
        ...ext,
      };

      res.json({ destination: fullDestination });
    } catch (err: any) {
      console.error('Error in GET /api/destinations/:id:', err);
      res.status(500).json({ error: 'Failed to fetch destination details' });
    }
  });

  // 11. GET /api/destinations/:id/nearby
  app.get('/api/destinations/:id/nearby', (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
      const target = allDests.find((d) => d.id === id || d.slug === id);

      if (!target) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }

      const radiusKm = Number(req.query.radiusKm) || 350;
      const nearby = allDests
        .filter((d) => d.id !== target.id)
        .map((d) => ({
          ...d,
          distanceKm: calculateHaversineDistanceKm(
            target.location.latitude,
            target.location.longitude,
            d.location.latitude,
            d.location.longitude
          ),
        }))
        .filter((d) => (d.distanceKm ?? 9999) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      res.json({ targetId: id, radiusKm, total: nearby.length, destinations: nearby });
    } catch (err: any) {
      res.status(500).json({ error: 'Nearby destination lookup failed' });
    }
  });

  // 12. GET /api/destinations/:id/experiences
  app.get('/api/destinations/:id/experiences', (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const matching = INITIAL_EXPERIENCES.filter((e) => e.destinationId === id || e.destinationName.toLowerCase() === id.toLowerCase());
      res.json({ destinationId: id, total: matching.length, experiences: matching });
    } catch (err: any) {
      res.status(500).json({ error: 'Destination experiences lookup failed' });
    }
  });

  // 13. GET /api/experiences
  app.get('/api/experiences', (req: Request, res: Response) => {
    try {
      const type = typeof req.query.type === 'string' ? req.query.type : '';
      const intensity = typeof req.query.intensity === 'string' ? req.query.intensity : '';
      const budget = typeof req.query.budget === 'string' ? req.query.budget : '';
      const search = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';

      let filtered = INITIAL_EXPERIENCES.filter((e) => {
        if (type && e.experienceType !== type) return false;
        if (intensity && e.intensity !== intensity) return false;
        if (budget && e.budgetTier !== budget) return false;
        if (search) {
          const matchTitle = e.title.toLowerCase().includes(search);
          const matchDesc = e.description.toLowerCase().includes(search);
          const matchDest = e.destinationName.toLowerCase().includes(search);
          if (!matchTitle && !matchDesc && !matchDest) return false;
        }
        return true;
      });

      res.json({ total: filtered.length, experiences: filtered });
    } catch (err: any) {
      res.status(500).json({ error: 'Experiences lookup failed' });
    }
  });

  // 14. GET /api/experiences/:id
  app.get('/api/experiences/:id', (req: Request, res: Response) => {
    const item = INITIAL_EXPERIENCES.find((e) => e.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    const related = INITIAL_EXPERIENCES.filter((e) => e.id !== item.id && (e.destinationId === item.destinationId || e.experienceType === item.experienceType)).slice(0, 3);
    res.json({ experience: item, relatedExperiences: related });
  });

  // 15. POST /api/experiences/:id/save
  app.post('/api/experiences/:id/save', (req: Request, res: Response) => {
    const id = req.params.id;
    const item = INITIAL_EXPERIENCES.find((e) => e.id === id);
    if (!item) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    res.json({ success: true, message: `Saved experience: ${item.title}`, savedAt: new Date().toISOString() });
  });

  // 16. POST /api/experiences/:id/feedback
  app.post('/api/experiences/:id/feedback', (req: Request, res: Response) => {
    const id = req.params.id;
    const { helpful, comment } = req.body || {};
    res.json({ success: true, message: 'Thank you for your feedback.', experienceId: id, received: { helpful, comment } });
  });

  // 17. GET /api/food
  app.get('/api/food', (req: Request, res: Response) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : '';
      const dietary = typeof req.query.dietary === 'string' ? req.query.dietary : '';
      const budget = typeof req.query.budget === 'string' ? req.query.budget : '';
      const search = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';

      let filtered = INITIAL_FOOD_PLACES.filter((f) => {
        if (category && f.foodCategory !== category) return false;
        if (dietary && f.dietaryPreference !== dietary) return false;
        if (budget && f.budgetTier !== budget) return false;
        if (search) {
          const matchName = f.name.toLowerCase().includes(search);
          const matchCuisine = f.cuisineType.toLowerCase().includes(search);
          const matchCity = f.destinationName.toLowerCase().includes(search);
          if (!matchName && !matchCuisine && !matchCity) return false;
        }
        return true;
      });

      res.json({ total: filtered.length, foodPlaces: filtered });
    } catch (err: any) {
      res.status(500).json({ error: 'Food places lookup failed' });
    }
  });

  // 18. GET /api/food/:id
  app.get('/api/food/:id', (req: Request, res: Response) => {
    const item = INITIAL_FOOD_PLACES.find((f) => f.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Food place not found' });
      return;
    }
    const nearby = INITIAL_FOOD_PLACES.filter((f) => f.id !== item.id && f.destinationName === item.destinationName).slice(0, 3);
    res.json({ foodPlace: item, nearbyFoodPlaces: nearby });
  });

  // 19. GET /api/events
  app.get('/api/events', (req: Request, res: Response) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : '';
      const city = typeof req.query.city === 'string' ? req.query.city.toLowerCase() : '';
      const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : '';
      const search = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';

      let filtered = INITIAL_SEASONAL_EVENTS.filter((ev) => {
        if (category && ev.category !== category) return false;
        if (city && ev.city?.toLowerCase() !== city && ev.destinationName.toLowerCase() !== city) return false;
        if (startDate && ev.startDate && ev.startDate < startDate) return false;
        if (search) {
          const matchName = ev.name.toLowerCase().includes(search);
          const matchDesc = ev.description.toLowerCase().includes(search);
          const matchCity = (ev.city || ev.destinationName).toLowerCase().includes(search);
          if (!matchName && !matchDesc && !matchCity) return false;
        }
        return true;
      });

      res.json({ total: filtered.length, events: filtered });
    } catch (err: any) {
      res.status(500).json({ error: 'Events lookup failed' });
    }
  });

  // 20. GET /api/events/:id
  app.get('/api/events/:id', (req: Request, res: Response) => {
    const item = INITIAL_SEASONAL_EVENTS.find((ev) => ev.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json({ event: item });
  });

  // 21. In-memory saved items storage
  const inMemorySavedItems = new Map<string, any>();
  const inMemoryItineraryItems = new Map<string, any>();

  // POST /api/saved-items
  app.post('/api/saved-items', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      res.status(400).json({ error: 'Item with id is required.' });
      return;
    }
    inMemorySavedItems.set(item.id, { ...item, savedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Saved successfully', itemId: item.id });
  });

  // DELETE /api/saved-items/:id
  app.delete('/api/saved-items/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    inMemorySavedItems.delete(id);
    res.json({ success: true, message: 'Removed from saved items', itemId: id });
  });

  // GET /api/saved-items
  app.get('/api/saved-items', (_req: Request, res: Response) => {
    res.json({ savedItems: Array.from(inMemorySavedItems.values()) });
  });

  // POST /api/itinerary/items
  app.post('/api/itinerary/items', (req: Request, res: Response) => {
    const item = req.body;
    if (!item || !item.id) {
      res.status(400).json({ error: 'Item with id is required.' });
      return;
    }
    if (inMemoryItineraryItems.has(item.id)) {
      res.status(200).json({ success: true, alreadyAdded: true, message: 'Already in your itinerary', itemId: item.id });
      return;
    }
    inMemoryItineraryItems.set(item.id, { ...item, addedAt: new Date().toISOString() });
    res.json({ success: true, alreadyAdded: false, message: 'Added to itinerary', itemId: item.id });
  });

  // DELETE /api/itinerary/items/:id
  app.delete('/api/itinerary/items/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    inMemoryItineraryItems.delete(id);
    res.json({ success: true, message: 'Removed from itinerary', itemId: id });
  });

  // GET /api/itinerary/items
  app.get('/api/itinerary/items', (_req: Request, res: Response) => {
    res.json({ itineraryItems: Array.from(inMemoryItineraryItems.values()) });
  });

  // 10. GET /api/destinations/nearby
  app.get('/api/destinations/nearby', (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : undefined;
      const lon = req.query.lng ? Number(req.query.lng) : (req.query.lon ? Number(req.query.lon) : undefined);
      const userCity = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';
      const radiusKm = Number(req.query.radiusKm) || 250;

      const origin = (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon))
        ? { latitude: lat, longitude: lon }
        : getCityCoordinates(userCity);

      const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS].map((d) => ({
        ...d,
        distanceKm: calculateHaversineDistanceKm(origin.latitude, origin.longitude, d.location.latitude, d.location.longitude),
      }));

      const nearby = allDests
        .filter((d) => (d.distanceKm ?? 9999) <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

      res.json({ origin, radiusKm, total: nearby.length, destinations: nearby });
    } catch (err: any) {
      res.status(500).json({ error: 'Nearby destinations failed' });
    }
  });

  // In-memory assistant history store
  const serverAssistantHistory: AssistantChatMessage[] = [
    {
      id: 'msg_init',
      sender: 'assistant',
      text: 'Namaste! I am your Bharat Yatra AI Travel Assistant, grounded in verified government, ASI, and state tourism archives. How may I help you plan your journey across India today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [
        {
          sourceName: 'Archaeological Survey of India (ASI)',
          lastUpdated: '2026-08-01',
          confidenceScore: 98,
        },
      ],
      citations: ['ASI Official Registry'],
    },
  ];

  // 22. GET /api/recommendations (Part 2C Recommendation Pipeline)
  app.get('/api/recommendations', (req: Request, res: Response) => {
    try {
      const city = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';
      const interestsStr = typeof req.query.interests === 'string' ? req.query.interests : '';
      const budget = (typeof req.query.budget === 'string' ? req.query.budget : 'moderate') as any;
      const duration = (typeof req.query.duration === 'string' ? req.query.duration : 'weekend') as any;
      const party = (typeof req.query.party === 'string' ? req.query.party : 'solo') as any;
      const pace = (typeof req.query.pace === 'string' ? req.query.pace : 'balanced') as any;
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
      const season = typeof req.query.season === 'string' ? req.query.season : 'Autumn';
      const maxDistanceKm = req.query.maxDistance ? Number(req.query.maxDistance) : undefined;
      const wheelchair = req.query.wheelchair === 'true';
      const senior = req.query.senior === 'true';

      const interests = interestsStr ? interestsStr.split(',').filter(Boolean) : ['heritage', 'nature', 'spiritual'];

      const preferences: UserPreferences = {
        language: 'en',
        selectedCity: city,
        useCurrentLocation: false,
        interests: interests as any,
        budget,
        duration,
        party,
        pace,
        accessibility: [
          ...(wheelchair ? ['wheelchair_friendly' as const] : []),
          ...(senior ? ['senior_friendly' as const] : []),
        ],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 5,
      };

      const results = RecommendationService.getRecommendations(preferences, {
        limit,
        currentSeason: season,
        constraintsOverride: {
          maxDistanceKm,
          requireWheelchair: wheelchair,
          seniorFriendlyOnly: senior,
        },
      });

      res.json({
        total: results.length,
        userCity: city,
        recommendations: results,
      });
    } catch (err: any) {
      console.error('Error in GET /api/recommendations:', err);
      res.status(500).json({ error: 'Failed to generate recommendations', details: err?.message });
    }
  });

  // 23. POST /api/recommendations/feedback (Part 2C Recommendation Feedback)
  app.post('/api/recommendations/feedback', (req: Request, res: Response) => {
    try {
      const { targetId, targetType, action, reason, category } = req.body || {};
      if (!targetId || !action) {
        res.status(400).json({ error: 'targetId and action are required.' });
        return;
      }

      const feedback = FeedbackService.recordFeedback(
        targetId,
        targetType || 'destination',
        action,
        reason,
        category
      );

      res.json({
        success: true,
        feedback,
        message: `Feedback '${action}' applied. Personalization will adjust dynamically.`,
        behaviorProfile: FeedbackService.getProfile(),
      });
    } catch (err: any) {
      console.error('Error in POST /api/recommendations/feedback:', err);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // 24. POST /api/recommendations/reset (Part 2C Reset Personalization)
  app.post('/api/recommendations/reset', (_req: Request, res: Response) => {
    try {
      FeedbackService.resetPersonalization();
      res.json({
        success: true,
        message: 'Personalization profile reset to default onboarding parameters.',
        behaviorProfile: FeedbackService.getProfile(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reset personalization' });
    }
  });

  // 25. GET /api/recommendations/explanations/:id (Part 2C Recommendation Explanations)
  app.get('/api/recommendations/explanations/:id', (req: Request, res: Response) => {
    try {
      const targetId = req.params.id;
      const city = typeof req.query.city === 'string' ? req.query.city : 'Nagpur';

      const preferences: UserPreferences = {
        language: 'en',
        selectedCity: city,
        useCurrentLocation: false,
        interests: ['heritage', 'spiritual'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 5,
      };

      const results = RecommendationService.getRecommendations(preferences, { limit: 50 });
      const found = results.find((r) => r.id === targetId || r.candidateId === targetId);

      if (!found) {
        res.status(404).json({ error: 'Recommendation item not found' });
        return;
      }

      res.json({
        id: found.id,
        title: found.title,
        matchScore: found.matchScore,
        explanation: found.explanation,
        source: found.source,
        verificationStatus: found.verificationStatus,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch explanation' });
    }
  });

  // 26. POST /api/assistant/chat (Part 2C Full RAG AI Assistant)
  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const { prompt, preferences, memoryContext } = req.body || {};

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'prompt string is required.' });
        return;
      }

      const userPrefs: UserPreferences = preferences || {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage', 'nature'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 5,
      };

      // 1. Execute Grounded RAG Retrieval
      const rag = RetrievalService.executeRAG(prompt, userPrefs);

      let replyText = rag.responseText;
      const apiKey = process.env.GEMINI_API_KEY;

      // 2. If Gemini API key is available, synthesize with Gemini SDK
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction = `You are "Bharat Yatra AI", an authentic, culturally respectful, and insightful travel assistant for India.
User is traveling from: ${userPrefs.selectedCity}.
User preferences: Language: ${userPrefs.language}, Interests: ${(userPrefs.interests || []).join(', ')}, Budget: ${userPrefs.budget}, Party: ${userPrefs.party}, Pace: ${userPrefs.pace}.
Grounded Context retrieved from official ASI and Tourism records:
${rag.responseText}

Guidelines:
1. Provide accurate, culturally sensitive, and actionable Indian travel recommendations.
2. Emphasize sustainable tourism, heritage conservation, local culinary treasures, and seasonal realities.
3. Keep the tone warm, respectful, concise, structured with clean bullet points.
4. Ground your answer strictly in the facts provided in the context; never invent prices, schedules, or unconfirmed availability.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: { systemInstruction, temperature: 0.7 },
          });

          if (response.text) {
            replyText = response.text;
          }
        } catch (aiErr) {
          console.warn('Gemini API call failed, falling back to grounded deterministic RAG:', aiErr);
        }
      }

      const message: AssistantChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: rag.intent,
        entities: rag.entities,
        sources: rag.sources,
        citations: rag.citations,
        cardPayloads: rag.cardPayloads,
        clarifyingQuestion: rag.clarifyingQuestion,
        warningNote: rag.warningNote,
      };

      serverAssistantHistory.push({
        id: `usr_${Date.now()}`,
        sender: 'user',
        text: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      serverAssistantHistory.push(message);

      if (serverAssistantHistory.length > 40) {
        serverAssistantHistory.splice(0, serverAssistantHistory.length - 40);
      }

      res.json(message);
    } catch (err: any) {
      console.error('Error in POST /api/assistant/chat:', err);
      res.status(500).json({ error: 'Assistant processing failed', details: err?.message });
    }
  });

  // 27. POST /api/assistant/clarify
  app.post('/api/assistant/clarify', (req: Request, res: Response) => {
    try {
      const { option, contextKey, preferences } = req.body || {};
      const userPrefs: UserPreferences = preferences || {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 5,
      };

      const clarifiedQuery = `I prefer ${option} for my trip. Please recommend matching destinations and activities.`;
      const rag = RetrievalService.executeRAG(clarifiedQuery, userPrefs);

      const msg: AssistantChatMessage = {
        id: `ast_clarified_${Date.now()}`,
        sender: 'assistant',
        text: `Understood! Focus tailored for **${option}**:\n\n` + rag.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: rag.intent,
        entities: rag.entities,
        sources: rag.sources,
        citations: rag.citations,
        cardPayloads: rag.cardPayloads,
      };

      serverAssistantHistory.push(msg);
      res.json(msg);
    } catch (err: any) {
      res.status(500).json({ error: 'Clarification handling failed' });
    }
  });

  // 28. GET /api/assistant/history
  app.get('/api/assistant/history', (_req: Request, res: Response) => {
    res.json({ history: serverAssistantHistory });
  });

  // 29. DELETE /api/assistant/history
  app.delete('/api/assistant/history', (_req: Request, res: Response) => {
    serverAssistantHistory.length = 0;
    res.json({ success: true, message: 'Assistant history cleared.' });
  });

  // Legacy AI Assistant endpoint using server-side Gemini API SDK (kept for backward compatibility)
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    try {
      const { prompt, userCity, language, interests, budget, party, pace } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Transparent fallback if key not configured yet
        res.json({
          reply: `Namaste! Here are grounded travel insights for your query regarding ${userCity || 'India'}:\n\n• Circuit Recommendation: Plan 2-3 days for heritage landmarks, dedicating mornings to temple ghats or forts before midday heat.\n• Cultural Etiquette: Dress conservatively, remove footwear at sacred sanctums, and support certified local artisans.\n• Timing: October through March offers pleasant weather across most regions.`,
          sources: ['Incredible India Official Archives', 'Ministry of Tourism'],
          classification: 'AI_GENERATED',
        });
        return;
      }

      // Initialize Gemini SDK lazily as mandated
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are "Bharat Yatra AI", an authentic, culturally respectful, and insightful travel companion for India.
The user is traveling from or in: ${userCity || 'Nagpur'}.
User preferences: Language: ${language || 'en'}, Interests: ${(interests || []).join(', ')}, Budget: ${budget || 'moderate'}, Party: ${party || 'solo'}, Pace: ${pace || 'balanced'}.
Guidelines:
1. Provide accurate, culturally sensitive, and actionable Indian travel recommendations.
2. Emphasize sustainable tourism, heritage conservation, local culinary treasures, and seasonal climate realities (monsoons, mountain passes).
3. If giving advice in Hindi or Marathi, use clean, respectful, natural phrasing.
4. Keep the tone warm, respectful, concise, and structured with clean bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Namaste! Please explore our curated destinations and seasonal recommendations.';

      res.json({
        reply: replyText,
        sources: ['Archaeological Survey of India (ASI)', 'Ministry of Tourism (India)', 'Bharat Yatra Editorial Board'],
        classification: 'AI_GENERATED',
      });
    } catch (error: any) {
      console.error('Error handling AI assistant query:', error);
      res.status(500).json({
        error: 'Failed to generate AI travel suggestion.',
        details: error?.message || 'Server error',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat Yatra server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
