import openai from '../clients/openai.client';
import prisma from '../lib/prisma';
import { AIGeneratedRoute, AIRestaurantRecommendation, AIWorkoutAnalysis, WorkoutType } from '@smartproject/types';

const FIT_TRAVEL_SYSTEM_PROMPT = `Tu es Fit & Travel AI, un coach sportif et nutritionnel expert pour les voyageurs.
Tu crées des parcours de sport sécurisés dans le monde entier, passes par des points d'intérêt culturels, et recommandes des plats locaux adaptés aux objectifs de l'utilisateur.
Tes réponses pour les endpoints structurés sont TOUJOURS en JSON valide.
Tu réponds en français sauf demande contraire.
Tu es enthousiaste, précis, et motivant.`;

// ─── Generate a running/walking/cycling route ──────────────────────────────

export async function generateRoute(
  city: string,
  country: string,
  activityType: string,
  distanceKm: number,
  difficulty: string,
  userProfile?: { fitnessGoal?: string; weightKg?: number }
): Promise<AIGeneratedRoute> {
  // --- MOCK FALLBACK SI PAS DE CLÉ OPENAI ---
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("...")) {
    console.log("⚠️ Using mock AI route generation (No valid OpenAI API Key)");
    return {
      name: `Parcours Découverte - ${city}`,
      description: `Un superbe itinéraire de ${distanceKm}km à travers les plus beaux coins de ${city}.`,
      distanceKm: distanceKm,
      estimatedMinutes: distanceKm * 6,
      difficulty: difficulty as any,
      waypoints: [
        { lat: 48.8566, lng: 2.3522, name: "Départ Centre-Ville", type: "start" },
        { lat: 48.8584, lng: 2.3488, name: "Monument Historique", type: "poi" },
        { lat: 48.8606, lng: 2.3376, name: "Parc Principal", type: "poi" },
        { lat: 48.8566, lng: 2.3522, name: "Retour", type: "end" }
      ],
      pointsOfInterest: [
        { name: "Monument Historique", type: "monument", description: "Un lieu chargé d'histoire." },
        { name: "Parc Principal", type: "park", description: "Idéal pour une pause nature." }
      ],
      safetyScore: 9,
      safetyNotes: "Quartiers très sûrs, forte affluence en journée.",
      bestTimeOfDay: "morning",
      tips: ["Prenez une gourde", "Attention aux pavés au kilomètre 2"]
    };
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: FIT_TRAVEL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Génère un parcours de ${activityType.toLowerCase()} à ${city}, ${country}.
Distance cible : ~${distanceKm}km. Niveau : ${difficulty}.
${userProfile?.fitnessGoal ? `Objectif : ${userProfile.fitnessGoal}.` : ''}

Passe par des monuments, musées, parcs ou points d'intérêt locaux emblématiques.
Assure-toi que le parcours est sécurisé, bien éclairé et praticable.

Réponds UNIQUEMENT avec ce JSON :
{
  "name": "nom du parcours",
  "description": "description courte et motivante",
  "distanceKm": number,
  "estimatedMinutes": number,
  "difficulty": "EASY|MODERATE|HARD",
  "waypoints": [{"lat": number, "lng": number, "name": "string", "type": "start|end|poi|waypoint"}],
  "pointsOfInterest": [{"name": "string", "type": "string", "description": "string"}],
  "safetyScore": number (1-10),
  "safetyNotes": "conseils de sécurité",
  "bestTimeOfDay": "morning|afternoon|evening",
  "tips": ["conseil pratique 1", "conseil pratique 2", "conseil pratique 3"]
}`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!) as AIGeneratedRoute;
}

// ─── Recommend local restaurants matching macros ───────────────────────────

export async function recommendRestaurants(
  city: string,
  country: string,
  targetCalories: number,
  fitnessGoal: string,
  restrictions?: string[]
): Promise<AIRestaurantRecommendation[]> {
  // --- MOCK FALLBACK SI PAS DE CLÉ OPENAI ---
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("...")) {
    console.log("⚠️ Using mock AI restaurant recommendations (No valid OpenAI API Key)");
    return [
      {
        restaurant: `Brasserie Locale de ${city}`,
        mealName: "Poulet grillé et légumes de saison",
        description: "Un plat riche en protéines, parfaitement cuit au feu de bois avec des herbes typiques.",
        caloriesKcal: targetCalories - 50,
        proteinG: 45,
        carbsG: 30,
        fatG: 12,
        tags: ["local", "high-protein", "healthy"],
        whyRecommended: `Idéal pour votre objectif : ${fitnessGoal}. Faible en graisses saturées.`,
        priceRange: "€€"
      },
      {
        restaurant: "Salad Bar du Marché",
        mealName: "Bol Quinoa & Avocat",
        description: "Un repas végétarien frais, plein de bons nutriments pour la récupération.",
        caloriesKcal: targetCalories + 20,
        proteinG: 20,
        carbsG: 65,
        fatG: 18,
        tags: ["vegetarian", "recovery", "local"],
        whyRecommended: "Excellente source de glucides lents après un effort.",
        priceRange: "€"
      }
    ];
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: FIT_TRAVEL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Recommande 4 plats locaux typiques à ${city}, ${country} adaptés à cet objectif : ${fitnessGoal}.
Calories cibles par repas : ~${targetCalories} kcal.
${restrictions?.length ? `Restrictions : ${restrictions.join(', ')}.` : ''}

Privilégie les plats LOCAUX et authentiques, pas les chaînes.

Réponds UNIQUEMENT avec ce JSON :
{
  "recommendations": [
    {
      "restaurant": "nom du restaurant ou type d'établissement",
      "mealName": "nom du plat",
      "description": "description appétissante",
      "caloriesKcal": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "tags": ["local", "high-protein", etc],
      "whyRecommended": "pourquoi c'est adapté à l'objectif",
      "priceRange": "€|€€|€€€"
    }
  ]
}`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0].message.content!);
  return parsed.recommendations as AIRestaurantRecommendation[];
}

// ─── Analyze workout performance ───────────────────────────────────────────

export async function analyzeWorkoutPerformance(
  weeklyData: Array<{
    weekNumber: number;
    distanceKm: number;
    durationMin: number;
    calories: number;
    sessions: number;
  }>,
  fitnessGoal: string,
  weeklyTargetKm: number
): Promise<AIWorkoutAnalysis> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: FIT_TRAVEL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyse ces performances sportives hebdomadaires et donne des conseils :

Données (${weeklyData.length} semaines) : ${JSON.stringify(weeklyData)}
Objectif : ${fitnessGoal}
Objectif km/semaine : ${weeklyTargetKm}km

Réponds UNIQUEMENT avec ce JSON :
{
  "summary": "résumé en 2 phrases",
  "performanceTrend": "improving|stable|declining",
  "strengths": ["point fort 1", "point fort 2"],
  "areasToImprove": ["axe d'amélioration 1", "axe 2"],
  "nextWeekGoal": "objectif concret pour la semaine prochaine",
  "recommendedWorkouts": ["entraînement recommandé 1", "entraînement 2", "entraînement 3"]
}`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!) as AIWorkoutAnalysis;
}

// ─── Streaming chat (fitness + travel assistant) ───────────────────────────

export async function streamFitChat(
  chatId: string,
  userId: string,
  userMessage: string,
  res: any
): Promise<void> {
  // Load history
  const chat = await prisma.fitChat.findFirst({ where: { id: chatId, userId }, include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } } });

  // Save user message
  await prisma.fitMessage.create({ data: { chatId, role: 'user', content: userMessage } });

  const history = (chat?.messages ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: FIT_TRAVEL_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  let fullContent = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      fullContent += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
  }

  await prisma.fitMessage.create({ data: { chatId, role: 'assistant', content: fullContent } });
  res.write('data: [DONE]\n\n');
  res.end();
}

// ─── Create a new chat ─────────────────────────────────────────────────────

export async function createFitChat(userId: string, title?: string) {
  return prisma.fitChat.create({
    data: { userId, title: title ?? 'Nouvelle conversation' },
    include: { messages: true },
  });
}

export async function listFitChats(userId: string) {
  return prisma.fitChat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
}
