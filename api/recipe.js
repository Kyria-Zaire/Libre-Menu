// api/recipe.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
const textModel   = genAI.getGenerativeModel({ model: 'gemini-pro' });

const cleanJson = (str) =>
  str.replace(/^[^{]*/, '').replace(/[^}]*$/, ''); // garde seulement {…}

// ---------- RETRY ROBUSTE ----------
async function robustGenerate(model, prompt, payload = null, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = payload
        ? await model.generateContent([prompt, payload])
        : await model.generateContent(prompt);
      return result;
    } catch (e) {
      if (i === retries - 1) throw e; // dernier essai → on lance
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
    return JSON.parse(cleanJson(result.response.text()));
  } catch {
    return [];
  }
};

// ---------- TEXTE ----------
const callTextAPI = async (ingredients) => {
  const prompt = `Tu es un chef cuisinier minimaliste et expert en cuisine des restes.
Règles ABSOLUES :
- Utilise TOUS les ingrédients fournis : ${ingredients.join(', ')}.
- Ne jamais proposer d’ingrédients contradictoires.
- Réponse UNIQUEMENT au format JSON ci-dessous, sans aucun commentaire avant ou après.
{
  "name":"Nom recette (≤5 mots)",
  "ingredients":["tous ingrédients, condiments inclus"],
  "shopping_list":["seuls ingrédients manquants"],
  "instructions":["Étape 1","Étape 2","…"]
}
Si tu échoues, je perds mon travail.`;

  try {
    const result = await robustGenerate(textModel, prompt);
    const raw = result.response.text();
    return JSON.parse(cleanJson(raw));
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