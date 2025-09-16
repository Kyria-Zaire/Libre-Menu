// On sélectionne les éléments HTML
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const ingredientsRecognitionSection = document.getElementById('ingredients-recognition-section');
const ingredientsList = document.getElementById('ingredients-list');
const getRecipeBtn = document.getElementById('get-recipe-btn');
const resultSection = document.getElementById('result-section');

// Gérer l'upload de l'image
imageUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Affiche l'image sélectionnée
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Affiche le message de chargement
    ingredientsRecognitionSection.classList.add('hidden');
    getRecipeBtn.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultSection.innerHTML = '<p>Analyse de votre image et génération de la recette...</p>';

    // Envoie l'image au backend
    try {
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: await toBase64(file) })
        });
        
        if (!response.ok) {
            throw new Error('Erreur de connexion au serveur.');
        }

        const data = await response.json();
        const { recognizedIngredients, recipe } = data;
        
        // Affiche les ingrédients et la recette
        displayRecognizedIngredients(recognizedIngredients);
        displayRecipe(recipe);

        ingredientsRecognitionSection.classList.remove('hidden');
        getRecipeBtn.classList.remove('hidden'); // Plus besoin, on peut le masquer
        
    } catch (error) {
        console.error('Erreur:', error);
        resultSection.innerHTML = `<p style="color:red;">Désolé, une erreur est survenue. Veuillez réessayer.</p>`;
    }
});

// Fonctions utilitaires
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function displayRecognizedIngredients(ingredients) {
    ingredientsList.innerHTML = '';
    ingredients.forEach(ingredient => {
        const tag = document.createElement('span');
        tag.className = 'ingredient-tag';
        tag.textContent = ingredient;
        ingredientsList.appendChild(tag);
    });
}

function displayRecipe(recipe) {
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

    resultSection.innerHTML = htmlContent;
}