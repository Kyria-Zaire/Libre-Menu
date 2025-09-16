// api/recipe.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const textModel  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const cleanJson = (str) =>
  str.replace(/```json\n?/g, '').replace(/```/g, '').trim();

const callVisionAPI = async (base64Image) => {
  const prompt = 'Liste tous les aliments visibles en JSON unique. Réponse : ["item1", "item2", …]';
  const result = await visionModel.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image.split(',')[1],
        mimeType: 'image/jpeg',
      },
    },
  ]);
  try {
    return JSON.parse(cleanJson(result.response.text()));
  } catch {
    return [];
  }
};

const callTextAPI = async (ingredients) => {
  const prompt = `… (même prompt qu’avant) …`;
  const result = await textModel.generateContent(prompt);
  try {
    return JSON.parse(cleanJson(result.response.text()));
  } catch {
    return {
      name: 'Recette non disponible',
      ingredients: [],
      shopping_list: [],
      instructions: ['Désolé, l’IA n’a pas pu générer de recette.'],
    };
  }
};

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