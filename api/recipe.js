// On importe les bibliothèques nécessaires
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Accède à la clé API depuis les variables d'environnement de Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialise le modèle de vision pour l'analyse d'image
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision-latest" });

// Initialise le modèle de texte pour la génération de recette
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

const callVisionAPI = async (base64Image) => {
    const visionPrompt = "Décris tous les ingrédients et aliments que tu vois sur cette image. Sois très précis et liste-les sous forme d'un tableau JSON. Ne réponds que sous la forme d'un tableau JSON. Exemple : ['tomates', 'oignons', 'ail', 'riz']";
    const result = await visionModel.generateContent([
        visionPrompt,
        {
            inlineData: {
                data: base64Image.split(",")[1],
                mimeType: "image/jpeg",
            }
        }
    ]);
    const response = await result.response;
    try {
        const recognizedIngredients = JSON.parse(response.text());
        return recognizedIngredients;
    } catch (error) {
        console.error("Erreur de parsing de la réponse de l'IA:", error);
        return [];
    }
};

const callTextAPI = async (ingredients) => {
    const prompt = `Tu es un chef cuisinier minimaliste et expert en cuisine des restes. Tu suis toutes les instructions à la lettre. Ton but est de générer des recettes réalisables avec les ingrédients fournis, sans en ignorer aucun. La réponse doit être au format JSON et contenir les champs suivants :
    {
      "name": "Nom de la recette (moins de 5 mots)",
      "ingredients": ["Liste de tous les ingrédients, incluant les condiments comme l'huile, le sel, le poivre."],
      "shopping_list": ["Liste des ingrédients à acheter qui ne sont pas dans la liste de l'utilisateur."],
      "instructions": ["Étape 1.", "Étape 2.", "Étape 3.", "..."]
    }
    Contraintes importantes :
    - Utilise ABSOLUMENT TOUS les ingrédients fournis.
    - Ne propose JAMAIS d'ingrédients qui contredisent un ingrédient déjà fourni (ex: pas de recette végétarienne si l'utilisateur a donné de la viande).
    Liste d'ingrédients de l'utilisateur : ${ingredients.join(', ')}`;
    
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    try {
        const recipeData = JSON.parse(response.text());
        return recipeData;
    } catch (error) {
        console.error("Erreur de parsing de la réponse de l'IA:", error);
        return {
            name: "Recette non disponible",
            ingredients: [],
            shopping_list: [],
            instructions: ["Désolé, l'IA n'a pas pu générer de recette. Veuillez essayer d'autres ingrédients."]
        };
    }
};

module.exports = async (request, response) => {
    const { image } = request.body;
    
    if (image) {
        try {
            const recognizedIngredients = await callVisionAPI(image);
            const recipe = await callTextAPI(recognizedIngredients);
            return response.status(200).json({ recognizedIngredients, recipe });
        } catch (error) {
            return response.status(500).json({ error: "Une erreur est survenue lors de la génération de la recette." });
        }
    }
    
    response.status(400).json({ error: "Aucune image fournie." });
};