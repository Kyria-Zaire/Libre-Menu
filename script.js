// On sélectionne les éléments HTML dont on a besoin
const ingredientsInput = document.getElementById('ingredients-input');
const getRecipeBtn = document.getElementById('get-recipe-btn');
const resultSection = document.getElementById('result-section');

// On ajoute un écouteur d'événement sur le bouton
getRecipeBtn.addEventListener('click', async () => {
    // 1. On récupère les ingrédients de l'utilisateur
    const ingredients = ingredientsInput.value;

    // On s'assure que l'utilisateur a bien entré des ingrédients
    if (ingredients.trim() === '') {
        alert('Veuillez entrer au moins un ingrédient !');
        return;
    }

    // 2. On affiche l'état de chargement
    getRecipeBtn.textContent = 'Recherche en cours...';
    getRecipeBtn.disabled = true;
    resultSection.innerHTML = '<p>Recherche d\'une recette magique...</p>';
    resultSection.classList.remove('hidden');

    // 3. Appel de l'IA (le vrai !)
    try {
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: ingredients })
        });
        
        if (!response.ok) {
            throw new Error('Erreur de connexion au serveur.');
        }

        const recipe = await response.json();
        
        // 4. On affiche la vraie recette sur la page
        displayRecipe(recipe);
        
    } catch (error) {
        // 5. En cas d'erreur, on affiche un message
        console.error('Erreur:', error);
        resultSection.innerHTML = `<p style="color:red;">Désolé, une erreur est survenue. Veuillez réessayer.</p>`;
        getRecipeBtn.textContent = 'Trouver ma recette';
        getRecipeBtn.disabled = false;
    }
});


// Fonction pour afficher la recette sur la page
function displayRecipe(recipe) {
    // On réinitialise l'état du bouton
    getRecipeBtn.textContent = 'Trouver ma recette';
    getRecipeBtn.disabled = false;

    // On construit l'HTML pour la recette
    let htmlContent = `<h2>${recipe.name}</h2>`;
    
    htmlContent += '<h3>Ingrédients nécessaires :</h3><ul>';
    recipe.ingredients.forEach(item => {
        htmlContent += `<li>${item}</li>`;
    });
    htmlContent += '</ul>';

    htmlContent += '<h3>Liste de courses :</h3><ul>';
    recipe.shopping_list.forEach(item => {
        htmlContent += `<li>${item}</li>`;
    });
    htmlContent += '</ul>';

    htmlContent += '<h3>Instructions :</h3><ol>';
    recipe.instructions.forEach(step => {
        htmlContent += `<li>${step}</li>`;
    });
    htmlContent += '</ol>';

    // On affiche le tout dans la section de résultat
    resultSection.innerHTML = htmlContent;
}