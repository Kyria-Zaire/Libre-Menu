// api/recipe.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const textModel   = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// ---------- RETRY ROBUSTE ----------
async function robustGenerate(model, prompt, payload = null, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = payload
        ? await model.generateContent([prompt, payload])
        : await model.generateContent(prompt);
      return result;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1))); // backoff
    }
  }
}

// ---------- VISION ----------
const callVisionAPI = async (base64Image) => {
  const prompt = 'Liste tous les aliments visibles en JSON unique. Réponse : ["item1", "item2", …]';
  const payload = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/jpeg',
    },
  };

  try {
    const result = await robustGenerate(visionModel, prompt, payload);
    const raw = result.response.text().replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// ---------- TEXTE ----------
const callTextAPI = async (ingredients) => {
  const prompt = `Tu es un robot JSON. Respecte scrupuleusement ces 4 lignes :
1. Utilise TOUS ces ingrédients : ${ingredients.join(', ')}.
2. Ne propose **aucun** ingrédient supplémentaire contradictoire.
3. Réponse **uniquement** ce JSON, **sans** texte avant/après :
{"name":"Nom (≤5 mots)","ingredients":[liste complète],"shopping_list":[manquants],"instructions":["Étape 1","Étape 2"]}
4. Si tu hésites, invente une recette simple quand même.`;

  try {
    const result = await robustGenerate(textModel, prompt);
    let raw = result.response.text();
    raw = raw.replace(/```/g, '').replace(/json/gi, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Pas de JSON détecté');
    return JSON.parse(match[0]);
  } catch (e) {
    console.warn('JSON invalide → fallback', e);
    return {
      name: 'Recette non disponible',
      ingredients: ingredients,
      shopping_list: [],
      instructions: ['Désolé, l’IA n’a pas pu formater la recette.'],
    };
  }
};

// ---------- HANDLER ----------
module.exports = async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'Aucune image fournie.' });

  try {
    const recognized = await callVisionAPI(image);
    const recipe     = await callTextAPI(recognized);
    res.status(200).json({ recognizedIngredients: recognized, recipe });
  } catch (err) {
    console.error('Function error:', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
};