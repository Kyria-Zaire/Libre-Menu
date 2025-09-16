// On sélectionne les éléments HTML
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const ingredientsRecognitionSection = document.getElementById('ingredients-recognition-section');
const ingredientsList = document.getElementById('ingredients-list');
const getRecipeBtn = document.getElementById('get-recipe-btn');
const resultSection = document.getElementById('result-section');

let recognizedIngredients = [];

// Étape 1 : Gérer l'upload de l'image
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

    // Prépare l'UI pour la reconnaissance des ingrédients
    ingredientsRecognitionSection.classList.remove('hidden');
    getRecipeBtn.classList.add('hidden');
    ingredientsList.innerHTML = '';
    resultSection.innerHTML = '<p>Analyse de votre image...</p>';

    // Envoie l'image au backend
    try {
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: await toBase64(file) })
        });
        
        if (!response.ok) {
            throw new Error('Erreur de connexion au serveur.');
        }

        const data = await response.json();
        recognizedIngredients = data.recognizedIngredients;

        // Affiche les ingrédients et le bouton de génération
        displayRecognizedIngredients(recognizedIngredients);
        resultSection.innerHTML = '<p>Liste d\'ingrédients prête !</p>';
        getRecipeBtn.classList.remove('hidden');

    } catch (error) {
        console.error('Erreur:', error);
        resultSection.innerHTML = `<p style="color:red;">Désolé, une erreur est survenue lors de l'analyse de l'image. Veuillez réessayer.</p>`;
    }
});


// Étape 2 : Gérer la génération de la recette
getRecipeBtn.addEventListener('click', async () => {
    if (recognizedIngredients.length === 0) {
        alert('Veuillez sélectionner au moins un ingrédient !');
        return;
    }

    // Affiche l'état de chargement
    getRecipeBtn.textContent = 'Génération en cours...';
    getRecipeBtn.disabled = true;
    resultSection.innerHTML = '<p>Préparation de la recette...</p>';

    try {
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: recognizedIngredients.join(', ') })
        });
        
        if (!response.ok) {
            throw new Error('Erreur de connexion au serveur.');
        }

        const recipe = await response.json();
        displayRecipe(recipe);
        
    } catch (error) {
        console.error('Erreur:', error);
        resultSection.innerHTML = `<p style="color:red;">Désolé, une erreur est survenue lors de la génération de la recette. Veuillez réessayer.</p>`;
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
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag-btn';
        removeBtn.textContent = 'x';
        removeBtn.addEventListener('click', () => {
            tag.remove();
            const index = recognizedIngredients.indexOf(ingredient);
            if (index > -1) {
                recognizedIngredients.splice(index, 1);
            }
        });
        
        tag.appendChild(removeBtn);
        ingredientsList.appendChild(tag);
    });
}

function displayRecipe(recipe) {
    getRecipeBtn.textContent = 'Générer ma recette';
    getRecipeBtn.disabled = false;

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