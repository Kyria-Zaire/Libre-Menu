// La plupart des plateformes serverless utilisent ce format
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Accède à la clé API depuis les variables d'environnement de Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision-latest" });

const callVisionAPI = async (base64Image) => {
    // Le prompt que nous enverrons à Gemini
    const visionPrompt = "Décris-moi tous les ingrédients et aliments que tu vois sur cette image. Sois très précis et liste-les sous forme de tableau JSON. Ne réponds que sous la forme d'un tableau JSON. Exemple : ['tomates', 'oignons', 'ail', 'riz']";
    
    // Le contenu que nous envoyons, incluant le texte et l'image
    const result = await model.generateContent([
        visionPrompt,
        {
            inlineData: {
                data: base64Image.split(",")[1],
                mimeType: "image/jpeg",
            }
        }
    ]);

    const response = await result.response;
    const recognizedIngredients = JSON.parse(response.text());
    
    return recognizedIngredients;
};

const callTextAPI = async (ingredients) => {
    const prompt = `Tu es un chef cuisinier minimaliste et expert en cuisine des restes. Tu suis toutes les instructions à la lettre. Ton but est de générer des recettes réalisables avec les ingrédients fournis, sans en ignorer aucun.

    À partir de la liste d'ingrédients ci-dessous, génère une recette simple en utilisant TOUS les ingrédients. La réponse doit être au format JSON et contenir les champs suivants :
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
    
    // Ici, le code appellerait une API de texte comme GPT-4
    // Pour la démo, on simule une réponse
    const recipeData = {
        name: "Poisson, riz et tomates à l'oignon",
        ingredients: ['Poisson', 'Riz', 'Tomates', 'Oignon'],
        shopping_list: ['Sel', 'Poivre', 'Huile'],
        instructions: [
            "Fais cuire le riz selon les instructions du paquet.",
            "Pendant ce temps, coupe le poisson, les tomates et l'oignon.",
            "Dans une poêle, fais revenir les oignons dans de l'huile. Ajoute les tomates et le poisson.",
            "Assaisonne de sel et de poivre. Sers le tout sur un lit de riz."
        ]
    };
    
    return recipeData;
};

module.exports = async (request, response) => {
    // 1. On récupère le fichier image (encodé en base64)
    const { image } = request.body;
    
    // Si une image est fournie, on la traite
    if (image) {
        // 2. On appelle l'IA de vision pour reconnaître les ingrédients
        const recognizedIngredients = await callVisionAPI(image);
        return response.status(200).json({ recognizedIngredients });
    }

    // 3. Si des ingrédients sont envoyés, on génère la recette
    const { ingredients } = request.body;
    const recipe = await callTextAPI(ingredients);
    
    // 4. On renvoie la réponse
    response.status(200).json(recipe);
};