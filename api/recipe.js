// Remarque : Le code ci-dessous est une simulation. En réalité, tu devrais intégrer
// une bibliothèque pour appeler une API de vision comme OpenAI ou Gemini.

const callVisionAPI = async (base64Image) => {
    // Cette fonction simule la reconnaissance d'image
    // L'IA de vision analyserait la base64Image et retournerait une liste d'ingrédients.
    console.log("Analyse de l'image par l'IA de vision...");
    
    // Exemple de réponse de l'IA de vision
    const ingredients = ['Riz', 'Poisson', 'Tomate', 'Oignon'];
    
    return ingredients;
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

    // 2. On appelle l'IA de vision pour reconnaître les ingrédients
    const recognizedIngredients = await callVisionAPI(image);

    // 3. On appelle notre IA de texte pour générer la recette
    const recipe = await callTextAPI(recognizedIngredients);
    
    // 4. On renvoie la réponse
    response.status(200).json(recipe);
};