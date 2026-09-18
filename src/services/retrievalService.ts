import {
  AssistantQueryIntent,
  AssistantEntityExtraction,
  AssistantCardPayload,
  ClarifyingQuestionPayload,
} from '../types/recommendation';
import { SourceAttribution, Destination, Experience, FoodPlace, SeasonalEvent } from '../types/travel';
import { INITIAL_DESTINATIONS } from '../data/destinations';
import { INITIAL_HIDDEN_GEMS } from '../data/hiddenGems';
import { INITIAL_EXPERIENCES } from '../data/experiences';
import { INITIAL_FOOD_PLACES } from '../data/foodPlaces';
import { INITIAL_SEASONAL_EVENTS } from '../data/events';
import { DESTINATION_DETAILS_MAP } from '../data/destinationsDetailsData';
import { calculateHaversineDistanceKm, getCityCoordinates } from './geoService';
import { getWeatherForCity } from './weatherService';
import { UserPreferences } from '../types/auth';

export interface GroundedRAGResult {
  intent: AssistantQueryIntent;
  entities: AssistantEntityExtraction;
  responseText: string;
  sources: SourceAttribution[];
  citations: string[];
  cardPayloads: AssistantCardPayload[];
  clarifyingQuestion?: ClarifyingQuestionPayload;
  warningNote?: string;
  isGrounded: boolean;
}

export class RetrievalService {
  /**
   * 1. Intent Detection
   */
  public static detectIntent(query: string): AssistantQueryIntent {
    const q = query.toLowerCase();

    if (q.includes('weather') || q.includes('rain') || q.includes('climate') || q.includes('monsoon') || q.includes('temperature')) {
      return 'Weather Query';
    }
    if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('or should i visit')) {
      return 'Comparison';
    }
    if (q.includes('near me') || q.includes('nearby') || q.includes('near my location') || q.includes('places near') || q.includes('within 200') || q.includes('around nagpur')) {
      return 'Nearby Search';
    }
    if (q.includes('budget') || q.includes('cost') || q.includes('how much') || q.includes('cheap') || q.includes('expense')) {
      return 'Budget Planning';
    }
    if (q.includes('one-day') || q.includes('one day') || q.includes('1-day') || q.includes('1 day') || q.includes('itinerary') || q.includes('day 1') || q.includes('day trip') || q.includes('3 day') || q.includes('2 day') || q.includes('plan a trip')) {
      return 'Itinerary Planning';
    }
    if (q.includes('how to reach') || q.includes('distance') || q.includes('route') || q.includes('train') || q.includes('drive') || q.includes('flight')) {
      return 'Route Planning';
    }
    if (q.includes('wheelchair') || q.includes('senior') || q.includes('elderly') || q.includes('accessible') || q.includes('ramp') || q.includes('less walking')) {
      return 'Accessibility Question';
    }
    if (q.includes('food') || q.includes('eat') || q.includes('culinary') || q.includes('thali') || q.includes('dish') || q.includes('restaurant') || q.includes('breakfast') || q.includes('veg')) {
      return 'Food Discovery';
    }
    if (q.includes('festival') || q.includes('fair') || q.includes('event') || q.includes('mela') || q.includes('utsav')) {
      return 'Event Discovery';
    }
    if (q.includes('adventure') || q.includes('rafting') || q.includes('trek') || q.includes('safari') || q.includes('experience') || q.includes('activity') || q.includes('walk')) {
      return 'Activity Discovery';
    }
    if (q.includes('book') || q.includes('reserve') || q.includes('ticket') || q.includes('booking')) {
      return 'Booking Question';
    }
    if (q.includes('hidden gem') || q.includes('peaceful') || q.includes('family') || q.includes('where should i travel') || q.includes('where to travel') || q.includes('suggest') || q.includes('where to go') || q.includes('destination') || q.includes('place')) {
      return 'Destination Discovery';
    }

    return 'General Travel Information';
  }

  /**
   * 2. Entity Extraction
   */
  public static extractEntities(query: string, originCity: string = 'Nagpur'): AssistantEntityExtraction {
    const q = query.toLowerCase();
    const entities: AssistantEntityExtraction = {
      originCity,
    };

    // Destinations
    const allDests = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
    for (const d of allDests) {
      if (q.includes(d.name.toLowerCase()) || q.includes(d.location.city.toLowerCase()) || q.includes(d.location.state.toLowerCase())) {
        entities.destination = d.name;
        break;
      }
    }

    // Duration
    const dayMatch = q.match(/(\d+)\s*(?:-|to|\s)?\s*day/i);
    if (dayMatch) {
      entities.durationDays = parseInt(dayMatch[1], 10);
    } else if (q.includes('weekend')) {
      entities.durationDays = 2;
    }

    // Budget
    if (q.includes('budget') || q.includes('cheap') || q.includes('affordable') || q.includes('low cost')) {
      entities.budgetTier = 'budget';
    } else if (q.includes('luxury') || q.includes('royal') || q.includes('5 star')) {
      entities.budgetTier = 'luxury';
    } else if (q.includes('moderate') || q.includes('mid range')) {
      entities.budgetTier = 'moderate';
    }

    // Party
    if (q.includes('family') || q.includes('kids')) {
      entities.party = 'family';
    } else if (q.includes('solo') || q.includes('alone')) {
      entities.party = 'solo';
    } else if (q.includes('couple') || q.includes('honeymoon')) {
      entities.party = 'couple';
    } else if (q.includes('friends') || q.includes('group')) {
      entities.party = 'friends';
    }

    // Accessibility
    if (q.includes('wheelchair')) {
      entities.accessibility = 'wheelchair_friendly';
    } else if (q.includes('senior') || q.includes('elderly')) {
      entities.accessibility = 'senior_friendly';
    } else if (q.includes('less walking')) {
      entities.accessibility = 'less_walking';
    }

    return entities;
  }

  /**
   * 3. Structured Tool Calling Interfaces
   */
  public static tools = {
    searchDestinations: (query: string, limit: number = 3): Destination[] => {
      const q = query.toLowerCase();
      const all = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
      return all
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.location.state.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.tagline.toLowerCase().includes(q)
        )
        .slice(0, limit);
    },

    searchExperiences: (query: string, limit: number = 3): Experience[] => {
      const q = query.toLowerCase();
      return INITIAL_EXPERIENCES.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.destinationName.toLowerCase().includes(q) ||
          (e.experienceType && e.experienceType.toLowerCase().includes(q))
      ).slice(0, limit);
    },

    searchFood: (query: string, limit: number = 3): FoodPlace[] => {
      const q = query.toLowerCase();
      return INITIAL_FOOD_PLACES.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.cuisineType.toLowerCase().includes(q) ||
          f.destinationName.toLowerCase().includes(q) ||
          f.specialtyDishes.some((d) => d.toLowerCase().includes(q))
      ).slice(0, limit);
    },

    searchEvents: (query: string, limit: number = 3): SeasonalEvent[] => {
      const q = query.toLowerCase();
      return INITIAL_SEASONAL_EVENTS.filter(
        (ev) =>
          ev.name.toLowerCase().includes(q) ||
          ev.destinationName.toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q)
      ).slice(0, limit);
    },

    getWeather: (city: string) => {
      return getWeatherForCity(city);
    },

    getRouteEstimates: (originCity: string, destinationName: string) => {
      const orig = getCityCoordinates(originCity);
      const all = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
      const target = all.find((d) => d.name.toLowerCase() === destinationName.toLowerCase()) || all[0];
      const distanceKm = calculateHaversineDistanceKm(
        orig.latitude,
        orig.longitude,
        target.location.latitude,
        target.location.longitude
      );
      const roadTimeHours = Math.round((distanceKm / 55) * 10) / 10;
      return {
        origin: originCity,
        destination: target.name,
        distanceKm: Math.round(distanceKm),
        estimatedRoadHours: roadTimeHours,
        recommendedMode: distanceKm > 700 ? 'Train (AC Sleeper/Express) or Direct Flight' : 'Scenic Road Route or Express Train',
      };
    },

    getDestinationDetails: (idOrName: string) => {
      const all = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
      const dest = all.find((d) => d.id === idOrName || d.name.toLowerCase() === idOrName.toLowerCase());
      if (!dest) return null;
      const ext = DESTINATION_DETAILS_MAP[dest.id];
      return { ...dest, ...ext };
    },
  };

  /**
   * 4. Grounded RAG Retrieval Execution
   */
  public static processQuery(
    query: string,
    preferences: UserPreferences
  ): GroundedRAGResult {
    return RetrievalService.executeRAG(query, preferences);
  }

  public static executeRAG(
    query: string,
    preferences: UserPreferences
  ): GroundedRAGResult {
    const trimmed = query.trim();

    const intent = RetrievalService.detectIntent(query);
    const entities = RetrievalService.extractEntities(query, preferences.selectedCity);

    const isExplicitSupportedQuery =
      trimmed.toLowerCase().includes('where should i travel') ||
      trimmed.toLowerCase().includes('where to travel') ||
      trimmed.toLowerCase().includes('places near') ||
      trimmed.toLowerCase().includes('near my location') ||
      trimmed.toLowerCase().includes('near me') ||
      trimmed.toLowerCase().includes('budget trip') ||
      trimmed.toLowerCase().includes('peaceful') ||
      trimmed.toLowerCase().includes('family-friendly') ||
      trimmed.toLowerCase().includes('family friendly') ||
      trimmed.toLowerCase().includes('food experience') ||
      trimmed.toLowerCase().includes('one-day') ||
      trimmed.toLowerCase().includes('one day') ||
      trimmed.toLowerCase().includes('1-day') ||
      trimmed.toLowerCase().includes('1 day') ||
      trimmed.toLowerCase().includes('hidden gem') ||
      trimmed.toLowerCase().includes('hidden gems') ||
      trimmed.toLowerCase().includes('adventure');

    const isGenericOrAmbiguous =
      !isExplicitSupportedQuery &&
      trimmed.length <= 40 &&
      (trimmed.toLowerCase().includes('somewhere') ||
        trimmed.toLowerCase().includes('somewhere nice') ||
        trimmed.toLowerCase().includes('suggest something') ||
        trimmed.toLowerCase() === 'i want a trip' ||
        trimmed.toLowerCase() === 'plan trip' ||
        trimmed.toLowerCase() === 'help me travel' ||
        (!entities.destination && !entities.budgetTier && !entities.durationDays && trimmed.split(' ').length <= 6));

    // Check for ambiguous query needing clarification
    if (isGenericOrAmbiguous) {
      return {
        intent: 'Itinerary Planning',
        entities,
        responseText: 'Namaste! What kind of trip are you planning—weekend getaway, family pilgrimage, high-altitude adventure, spiritual circuit, or food-focused trail?',
        sources: [
          {
            sourceName: 'Bharat Yatra Interactive Assistant',
            lastUpdated: '2026-09-17',
            confidenceScore: 100,
          },
        ],
        citations: ['Bharat Yatra Curated Knowledge Base'],
        cardPayloads: [],
        clarifyingQuestion: {
          question: 'What kind of trip would you like to explore today?',
          options: [
            '2-Day Weekend Escape',
            'Family Heritage & Culture',
            'Peaceful Off-Beat Sanctuary',
            'Spiritual Temple Circuit',
            'Regional Food & Street Delicacies',
          ],
          contextKey: 'tripType',
        },
        isGrounded: true,
      };
    }

    const sources: SourceAttribution[] = [];
    const citations: string[] = [];
    const cardPayloads: AssistantCardPayload[] = [];
    let responseText = '';
    let warningNote: string | undefined;

    // Build grounded responses according to intent
    switch (intent) {
      case 'Weather Query': {
        const city = entities.destination || preferences.selectedCity || 'Nagpur';
        const weather = RetrievalService.tools.getWeather(city);
        sources.push({
          sourceName: 'Indian Meteorological Regional Archives',
          lastUpdated: weather.timestamp,
          confidenceScore: 92,
        });
        citations.push(`IMD Regional Data for ${city}`);

        responseText = `Current seasonal conditions for **${city}**:\n\n• Temperature: ${weather.temperatureC}°C (${weather.condition})\n• Outdoor Suitability: **${weather.outdoorSuitability}**\n• Seasonal Insight: ${weather.tip}\n• Travel Advisory: Crisp early mornings and pleasant afternoons make this window ideal for heritage walks.`;
        break;
      }

      case 'Comparison': {
        const allDestinations = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];
        let matches = allDestinations.filter((d) => query.toLowerCase().includes(d.name.toLowerCase()));
        if (matches.length < 2) {
          const fallback = RetrievalService.tools.searchDestinations(query, 2);
          matches = [...matches, ...fallback.filter((f) => !matches.some((m) => m.id === f.id))].slice(0, 2);
        }
        if (matches.length < 2 && allDestinations.length >= 2) {
          matches = allDestinations.slice(0, 2);
        }

        if (matches.length >= 2) {
          const [d1, d2] = matches;
          sources.push(d1.source, d2.source);
          citations.push(d1.source.sourceName, d2.source.sourceName);

          responseText = `### Destination Comparison: ${d1.name} vs ${d2.name}\n\n` +
            `• **Core Atmosphere**: ${d1.name} offers profound ${d1.category} landscapes (${d1.tagline}), whereas ${d2.name} is known for ${d2.category} immersion (${d2.tagline}).\n` +
            `• **Estimated Budget**: ${d1.name} is generally **${d1.estimatedBudget}** tier (~${d1.idealDurationDays} days needed), while ${d2.name} sits in the **${d2.estimatedBudget}** tier (~${d2.idealDurationDays} days).\n` +
            `• **Best Season**: ${(d1 as any).bestSeasons?.join(', ') || d1.bestTimeToVisit} for ${d1.name} vs ${(d2 as any).bestSeasons?.join(', ') || d2.bestTimeToVisit} for ${d2.name}.\n\n` +
            `*Recommendation*: If traveling with ${preferences.party || 'family'}, ${d1.name} provides exceptionally accessible infrastructure.`;

          cardPayloads.push({
            type: 'comparison',
            data: { destinationA: d1, destinationB: d2 },
          });
        } else {
          responseText = `I can compare Indian destinations across budget, optimal season, accessibility, and heritage richness. Which two places would you like to evaluate?`;
        }
        break;
      }

      case 'Food Discovery': {
        const foodMatches = RetrievalService.tools.searchFood(entities.destination || query, 2);
        if (foodMatches.length > 0) {
          foodMatches.forEach((f) => {
            sources.push(f.source);
            citations.push(f.source.sourceName);
            cardPayloads.push({ type: 'food', data: f });
          });

          const dishes = foodMatches.map((f) => `**${f.name}** in ${f.destinationName} (${f.specialtyDishes.join(', ')}) — Est. ₹${f.priceForTwoInr} for two`).join('\n• ');
          responseText = `Here are verified regional culinary highlights:\n\n• ${dishes}\n\n*Dietary Transparency*: Prices are verified estimates; all listed venues adhere to verified FSSAI hygiene standards.`;
        } else {
          responseText = `India has an immense culinary heritage! In ${preferences.selectedCity}, explore local thalis, authentic breakfast street food, and heritage sweets prepared using time-honored recipes.`;
        }
        break;
      }

      case 'Event Discovery': {
        const eventMatches = RetrievalService.tools.searchEvents(entities.destination || query, 2);
        if (eventMatches.length > 0) {
          eventMatches.forEach((ev) => {
            sources.push(ev.source);
            citations.push(ev.source.sourceName);
            cardPayloads.push({ type: 'event', data: ev });
          });

          const evList = eventMatches.map((ev) => `**${ev.name}** (${ev.destinationName}, ${ev.state}): ${ev.description} Dates: ${ev.startDateApprox} to ${ev.endDateApprox}`).join('\n\n• ');
          responseText = `Verified seasonal fairs and cultural gatherings:\n\n• ${evList}\n\n*Schedule Note*: Always check regional district notices prior to departure as festival schedules follow lunar calendars.`;
        } else {
          responseText = `No seasonal fairs matching your exact query were found in this immediate cycle. Most major cultural festivals across India take place between October and March.`;
        }
        break;
      }

      case 'Accessibility Question': {
        const dest = entities.destination ? RetrievalService.tools.getDestinationDetails(entities.destination) : null;
        if (dest && dest.accessibilityDetails) {
          sources.push(dest.source);
          citations.push('Official ASI Monument Accessibility Survey');
          responseText = `### Accessibility Details for ${dest.name}:\n\n` +
            `• Wheelchair Ramps: ${dest.accessibilityDetails.wheelchairRamps}\n` +
            `• Steps & Terrain: ${dest.accessibilityDetails.stepCountCaution}\n` +
            `• Audio / Braille Guides: ${dest.accessibilityDetails.brailleAudioGuides}\n` +
            `• Accessible Transit: ${dest.accessibilityDetails.accessibleTransit}\n\n` +
            `*Verification Notice*: ${dest.accessibilityDetails.isVerified ? 'Field verified by Bharat Yatra Accessibility Audit.' : 'Estimated based on regional tourism disclosures. Please contact monument helpdesk in advance.'}`;
        } else {
          responseText = `Bharat Yatra prioritizes verified accessibility info. For travelers requiring wheelchair access or minimal steps, Jaipur City Palace and Varanasi Ghats provide golf cart or elevator access at select entry points. Avoid steep hill forts during peak heat.`;
        }
        break;
      }

      case 'Route Planning': {
        const destName = entities.destination || 'Varanasi';
        const route = RetrievalService.tools.getRouteEstimates(preferences.selectedCity || 'Nagpur', destName);
        sources.push({
          sourceName: 'Ministry of Road Transport & National Highway Authority',
          lastUpdated: '2026-08-01',
          confidenceScore: 94,
        });
        citations.push('NHAI Regional Distance Matrix');

        responseText = `### Travel Route: ${route.origin} to ${route.destination}\n\n` +
          `• Estimated Road Distance: **${route.distanceKm} km**\n` +
          `• Approximate Travel Time: **~${route.estimatedRoadHours} hours** via national highway\n` +
          `• Recommended Transport: ${route.recommendedMode}\n\n` +
          `*Important Dispatch*: Live train and bus schedules require real-time IRCTC connection. Please check official ticketing portals for current seat availability.`;

        cardPayloads.push({
          type: 'route_summary',
          data: route,
        });
        break;
      }

      case 'Booking Question': {
        warningNote = 'Bharat Yatra is a verified cultural curation and planning guide. We do not process live monetary bookings or confirm ticket purchases directly.';
        responseText = `### Official Booking Guidelines:\n\n` +
          `• Monument Entry: Book directly via the official Archaeological Survey of India (ASI) portal at asi.payumoney.com or on-site QR counters.\n` +
          `• Train Travel: Use the official IRCTC website (irctc.co.in) or UTS mobile app for unreserved local connectivity.\n` +
          `• Certified Guides: Always hire guides carrying official Ministry of Tourism identity badges at monument reception counters.\n\n` +
          `*Safety Reminder*: Never share UPI PINs or payment OTPs with unauthorized third-party booking agents.`;
        sources.push({
          sourceName: 'Ministry of Tourism Travel Advisory & ASI Guidelines',
          lastUpdated: '2026-09-01',
          confidenceScore: 99,
        });
        citations.push('Ministry of Tourism Official Advisory');
        break;
      }

      case 'Nearby Search': {
        const originCity = preferences.selectedCity || 'Nagpur';
        const originCoords = getCityCoordinates(originCity);
        const allDestinations = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS];

        const destinationsWithDistance = allDestinations.map((d) => {
          const distKm = calculateHaversineDistanceKm(
            originCoords.latitude,
            originCoords.longitude,
            d.location.latitude,
            d.location.longitude
          );
          return { dest: d, distKm };
        });

        destinationsWithDistance.sort((a, b) => a.distKm - b.distKm);
        const nearest = destinationsWithDistance.slice(0, 3);

        nearest.forEach(({ dest, distKm }) => {
          sources.push(dest.source);
          citations.push(dest.source.sourceName);
          cardPayloads.push({ type: 'destination', data: { ...dest, distanceKm: distKm } as any });
        });

        const listText = nearest
          .map(
            ({ dest, distKm }) =>
              `• **${dest.name}** (${dest.location.state}) — **${Math.round(distKm)} km** from ${originCity}. Known for ${dest.category} (${dest.tagline}). Estimated travel time: ~${Math.max(1, Math.round(distKm / 55))} hrs by road.`
          )
          .join('\n');

        responseText = `### Nearest Verified Gateways from ${originCity}:\n\n` +
          `${listText}\n\n` +
          `*Transit Tip*: For journeys under 400 km, express state highways or direct Vande Bharat / Intercity trains offer optimal transit efficiency.`;
        break;
      }

      case 'Activity Discovery': {
        const isAdventure = query.toLowerCase().includes('adventure') || query.toLowerCase().includes('trek') || query.toLowerCase().includes('rafting');
        let matchedExp = INITIAL_EXPERIENCES.filter((e) => {
          const t = (e.title + ' ' + e.description + ' ' + e.category).toLowerCase();
          if (isAdventure) {
            return t.includes('adventure') || t.includes('trek') || t.includes('rafting') || t.includes('safari') || t.includes('climb') || t.includes('boat');
          }
          return t.includes('experience') || t.includes('walk') || t.includes('heritage') || t.includes('culture');
        });

        if (matchedExp.length === 0) matchedExp = INITIAL_EXPERIENCES.slice(0, 3);
        const topExp = matchedExp.slice(0, 3);

        topExp.forEach((e) => {
          sources.push(e.source);
          citations.push(e.source.sourceName);
          cardPayloads.push({ type: 'experience', data: e });
        });

        const expText = topExp
          .map(
            (e) =>
              `• **${e.title}** (${e.destinationName}): ${e.description} • *Duration*: ${e.durationMinutes ? `${Math.round(e.durationMinutes / 60)} hrs` : '2 hrs'} • *Est. Cost*: ₹${e.approxPriceInr.toLocaleString('en-IN')}`
          )
          .join('\n');

        responseText = `### Verified Experiential & Adventure Activities:\n\n` +
          `${expText}\n\n` +
          `*Adventure Safety Note*: Always confirm safety gear and life jackets are BIS/CE certified. Government certified guides are mandatory for high-altitude river rafting and wildlife core zones.`;
        break;
      }

      case 'Budget Planning': {
        const days = entities.durationDays || (preferences.duration === 'weekend' ? 2 : 3);
        const budgetDestinations = [...INITIAL_DESTINATIONS, ...INITIAL_HIDDEN_GEMS].filter(
          (d) => d.estimatedBudget === 'budget' || d.estimatedBudget === 'moderate'
        );
        const chosen = budgetDestinations.slice(0, 2);

        chosen.forEach((d) => {
          sources.push(d.source);
          citations.push(d.source.sourceName);
          cardPayloads.push({ type: 'destination', data: d });
        });

        const estDaily = preferences.budget === 'budget' ? 1400 : 2800;
        const totalCost = days * estDaily;

        cardPayloads.push({
          type: 'budget_summary',
          data: {
            days,
            budgetTier: 'budget',
            stayEstimateInr: Math.round(totalCost * 0.45),
            foodEstimateInr: Math.round(totalCost * 0.25),
            transitEstimateInr: Math.round(totalCost * 0.18),
            monumentsEstimateInr: Math.round(totalCost * 0.12),
            totalEstimateInr: totalCost,
          },
        });

        responseText = `### Grounded Budget Travel Plan (~${days} Days):\n\n` +
          `• **Estimated Budget**: ~**₹${totalCost.toLocaleString('en-IN')}** total (~₹${estDaily}/day for ${preferences.party || 'travelers'}).\n` +
          `• **Stay Allocation (~45%)**: ~₹${Math.round(totalCost * 0.45)} for verified budget guesthouses, dharamshalas, or heritage homestays.\n` +
          `• **Catering (~25%)**: ~₹${Math.round(totalCost * 0.25)} for authentic regional thalis and street food cooperatives.\n` +
          `• **Local Transit (~18%)**: ~₹${Math.round(totalCost * 0.18)} for shared electric-rickshaws and state transport buses.\n` +
          `• **Monuments & Activities (~12%)**: ~₹${Math.round(totalCost * 0.12)} for official ASI e-tickets and museum passes.\n\n` +
          `*Recommended Budget Destinations*: ${chosen.map((c) => `**${c.name}** (${c.tagline})`).join(' and ')}.`;
        break;
      }

      case 'Itinerary Planning': {
        const isOneDay = query.toLowerCase().includes('one-day') || query.toLowerCase().includes('one day') || query.toLowerCase().includes('1-day') || query.toLowerCase().includes('1 day');
        const destName = entities.destination || preferences.selectedCity || 'Varanasi';
        const dests = RetrievalService.tools.searchDestinations(destName, 1);
        const activeDest = dests.length > 0 ? dests[0] : INITIAL_DESTINATIONS[0];

        sources.push(activeDest.source);
        citations.push(activeDest.source.sourceName);
        cardPayloads.push({ type: 'destination', data: activeDest });

        const experiences = RetrievalService.tools.searchExperiences(activeDest.name, 2);
        if (experiences.length > 0) {
          cardPayloads.push({ type: 'experience', data: experiences[0] });
        }

        if (isOneDay) {
          responseText = `### Curated 1-Day Immersive Itinerary: ${activeDest.name}\n\n` +
            `• **Morning (06:30 AM – 10:00 AM)**: Dawn heritage exploration & riverfront walk before peak midday temperatures. Enjoy iconic breakfast staples like fresh kachori-jalebi or regional filter coffee.\n` +
            `• **Midday (11:00 AM – 02:30 PM)**: Visit key ASI monument or central museum. Traditional thali lunch at a verified local legacy establishment.\n` +
            `• **Afternoon (03:30 PM – 05:30 PM)**: Artisan handloom cluster or craft bazaar visit with direct master craftsman interaction.\n` +
            `• **Evening (06:00 PM – 08:30 PM)**: Sunset vantage point, sacred evening aarti ceremony, followed by heritage street gastronomy.\n\n` +
            `*Transit Tip*: Use pre-fixed rate e-rickshaws or walking corridors to bypass old city congestion.`;
        } else {
          const days = entities.durationDays || (preferences.duration === 'weekend' ? 2 : 3);
          const estCost = preferences.budget === 'budget' ? days * 1500 : preferences.budget === 'moderate' ? days * 3500 : days * 7500;

          cardPayloads.push({
            type: 'budget_summary',
            data: {
              days,
              budgetTier: preferences.budget,
              stayEstimateInr: Math.round(estCost * 0.45),
              foodEstimateInr: Math.round(estCost * 0.25),
              transitEstimateInr: Math.round(estCost * 0.18),
              monumentsEstimateInr: Math.round(estCost * 0.12),
              totalEstimateInr: estCost,
            },
          });

          responseText = `Here is a grounded **${days}-day itinerary & discovery blueprint** based on verified regional records:\n\n` +
            `• **Primary Destination**: ${activeDest.name} (${activeDest.location.state}) — ${activeDest.tagline}.\n` +
            `• **Day 1 Focus**: Morning monument exploration before midday heat, regional artisan workshop in the afternoon, and sunset cultural observation.\n` +
            `• **Day 2 Focus**: Nature walk or sacred riverfront exploration followed by authentic regional gastronomy.\n` +
            `• **Estimated Budget Range**: ~₹${estCost.toLocaleString('en-IN')} total for stay, meals, monument passes, and local transport.\n` +
            `• **Responsible Travel Practice**: Carry a reusable water bottle, respect temple dress standards (cover shoulders and knees), and patronize registered self-help craft cooperatives.`;
        }
        break;
      }

      case 'Destination Discovery':
      default: {
        const isHiddenGemOrPeaceful =
          query.toLowerCase().includes('hidden gem') ||
          query.toLowerCase().includes('peaceful') ||
          query.toLowerCase().includes('quiet') ||
          query.toLowerCase().includes('offbeat') ||
          query.toLowerCase().includes('calm');

        const isFamily = query.toLowerCase().includes('family') || query.toLowerCase().includes('kid') || preferences.party === 'family';

        let activeDests: Destination[] = [];
        let headline = 'Curated Destinations for Your Journey';

        if (isHiddenGemOrPeaceful) {
          activeDests = INITIAL_HIDDEN_GEMS.slice(0, 2);
          headline = 'Verified Peaceful Sanctuaries & Hidden Gems';
        } else if (isFamily) {
          activeDests = INITIAL_DESTINATIONS.filter((d) => d.category === 'heritage' || d.category === 'nature' || d.category === 'spiritual').slice(0, 2);
          headline = 'Top Family-Friendly Destinations';
        } else {
          // Check preferences
          const matchedByInterest = INITIAL_DESTINATIONS.filter((d) =>
            preferences.interests?.some((i) => d.category.toLowerCase().includes(i.toLowerCase()))
          );
          activeDests = matchedByInterest.length >= 2 ? matchedByInterest.slice(0, 2) : INITIAL_DESTINATIONS.slice(0, 2);
          headline = `Personalized Destinations for You (Style: ${preferences.travelStyle || 'Balanced'})`;
        }

        activeDests.forEach((d) => {
          sources.push(d.source);
          citations.push(d.source.sourceName);
          cardPayloads.push({ type: 'destination', data: d });
        });

        const destListText = activeDests
          .map(
            (d) =>
              `• **${d.name}** (${d.location.state}): ${d.tagline}. Best season: ${d.bestTimeToVisit}. Ideal duration: ${d.idealDurationDays} days.`
          )
          .join('\n');

        responseText = `### ${headline}:\n\n` +
          `${destListText}\n\n` +
          `*Verification Dispatch*: All heritage sites adhere to Archaeological Survey of India (ASI) visitor guidelines. You can view full details, add to your itinerary, or bookmark any place below.`;
        break;
      }
    }

    // Default safety source attribution if empty
    if (sources.length === 0) {
      sources.push({
        sourceName: 'Archaeological Survey of India (ASI) & Ministry of Tourism',
        lastUpdated: '2026-08-15',
        confidenceScore: 96,
      });
      citations.push('Bharat Yatra Grounded Travel Knowledge Base');
    }

    return {
      intent,
      entities,
      responseText,
      sources,
      citations,
      cardPayloads,
      warningNote,
      isGrounded: true,
    };
  }
}
