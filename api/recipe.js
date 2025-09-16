// La plupart des plateformes serverless utilisent ce format
// On simule une connexion à une API d'IA
const callAIAPI = async (prompt) => {
    // Dans la réalité, ici on ferait un appel à une API comme celle de Gemini ou OpenAI
    // Exemple : const response = await fetch('https://api.ia-service.com/generate', { ... });
    
    // Pour l'instant, on renvoie une fausse réponse pour tester
    const recipeData = {
        name: 'Curry végétarien au riz',
        ingredients: ['Riz', 'Haricots verts', 'Lait de coco', 'Curry en poudre', 'Oignons'],
        shopping_list: ['Lait de coco', 'Curry en poudre'],
        instructions: [
            'Faites cuire le riz selon les instructions du paquet.',
            'Dans une poêle, faites revenir les oignons et les haricots verts.',
            'Ajoutez le lait de coco et le curry. Laissez mijoter.',
            'Servez le mélange sur le riz cuit.'
        ]
    };
    return recipeData;
};

module.exports = async (request, response) => {
    // 1. On récupère les ingrédients envoyés par notre site web
    const { ingredients } = request.body;
    
    // 2. On construit notre prompt pour l'IA
    const prompt = `Tu es un chef cuisinier simple et amical. Ton but est d'aider les gens à cuisiner un plat rapide avec ce qu'ils ont. À partir de la liste d'ingrédients ci-dessous, génère une recette simple et complète. Voici les règles strictes que tu dois suivre : 1. Le nom de la recette doit être court et facile à comprendre. 2. Crée une liste pour les "Ingrédients nécessaires" qui reprendra tous les ingrédients. 3. Crée une liste pour la "Liste de courses" qui ne contient que les ingrédients que l'utilisateur ne possède pas. 4. Rédige les "Instructions de préparation" en étapes courtes et claires. 5. Ton ton doit être simple, amical et encourageant. Voici les ingrédients de l'utilisateur : ${ingredients}`;
    
    // 3. On appelle notre "service d'IA"
    const recipe = await callAIAPI(prompt);
    
    // 4. On renvoie la réponse à notre site web
    response.status(200).json(recipe);
};