// Définis un rôle très précis
const systemPrompt = "Tu es un chef cuisinier minimaliste et expert en cuisine des restes. Tu suis toutes les instructions à la lettre. Ton but est de générer des recettes réalisables avec les ingrédients fournis, sans en ignorer aucun.";

// Définis les contraintes de format de la réponse
const userPrompt = `À partir de la liste d'ingrédients ci-dessous, génère une recette simple en utilisant TOUS les ingrédients. La réponse doit être au format JSON et contenir les champs suivants :
{
  "name": "Nom de la recette (moins de 5 mots)",
  "ingredients": ["Liste de tous les ingrédients, incluant les condiments comme l'huile, le sel, le poivre."],
  "shopping_list": ["Liste des ingrédients à acheter qui ne sont pas dans la liste de l'utilisateur."],
  "instructions": ["Étape 1.", "Étape 2.", "Étape 3.", "..."]
}

Contraintes importantes :
- Utilise ABSOLUMENT TOUS les ingrédients fournis.
- Ne propose JAMAIS d'ingrédients qui contredisent un ingrédient déjà fourni (ex: ne pas ajouter de viande ou de poisson si la recette est végétarienne).

Liste d'ingrédients de l'utilisateur : [INGRÉDIENTS_FOURNIS_PAR_UTILISATEUR]`;

const finalPrompt = systemPrompt + userPrompt;

// La plupart des plateformes serverless utilisent ce format
// On simule une connexion à une API d'IA
const callAIAPI = async (prompt) => {
    // Note importante : C'est ici que tu devras intégrer le vrai code pour appeler une API d'IA
    // Pour l'instant, on renvoie une fausse réponse pour tester la structure
    const recipeData = {
        name: 'Poisson riz et tomate',
        ingredients: ['Poisson', 'Riz', 'Tomate', 'Huile', 'Sel', 'Poivre'],
        shopping_list: ['Rien à acheter, félicitations !'],
        instructions: [
            'Faites cuire le riz selon les instructions du paquet.',
            'Dans une poêle, faites revenir le poisson et les tomates.',
            'Salez, poivrez et servez le poisson avec le riz cuit.'
        ]
    };
    return recipeData;
};

module.exports = async (request, response) => {
    // 1. On récupère les ingrédients envoyés par notre site web
    const { ingredients } = request.body;
    
    // 2. On construit notre prompt pour l'IA
    const prompt = finalPrompt.replace('[INGRÉDIENTS_FOURNIS_PAR_UTILISATEUR]', ingredients);
    
    // 3. On appelle notre "service d'IA"
    const recipe = await callAIAPI(prompt);
    
    // 4. On renvoie la réponse à notre site web
    response.status(200).json(recipe);
};