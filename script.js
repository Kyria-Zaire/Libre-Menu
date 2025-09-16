// On sélectionne les nouveaux éléments HTML de la V2
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const ingredientsRecognitionSection = document.getElementById('ingredients-recognition-section');
const ingredientsList = document.getElementById('ingredients-list');
const getRecipeBtn = document.getElementById('get-recipe-btn');
const resultSection = document.getElementById('result-section');

// On ajoute un écouteur d'événement sur le champ de fichier
imageUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // On affiche l'image sélectionnée
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // On prépare l'UI pour la reconnaissance des ingrédients
    ingredientsRecognitionSection.classList.add('hidden');
    getRecipeBtn.classList.add('hidden');
    ingredientsList.innerHTML = '';
    resultSection.innerHTML = '';

    // On simule l'appel à la fonction de reconnaissance d'image
    // PROCHAINE ÉTAPE: On remplacera cette partie par un VRAI appel à l'IA de vision
    const recognizedIngredients = await new Promise(resolve => {
        setTimeout(() => {
            const fakeIngredients = ['tomate', 'riz', 'oignon', 'lait de coco', 'ail', 'poivre'];
            resolve(fakeIngredients);
        }, 2000);
    });

    // On affiche les ingrédients reconnus et le bouton
    displayRecognizedIngredients(recognizedIngredients);
    ingredientsRecognitionSection.classList.remove('hidden');
    getRecipeBtn.classList.remove('hidden');
});


// On ajoute un écouteur d'événement sur le bouton "Générer ma recette"
getRecipeBtn.addEventListener('click', async () => {
    // 1. On récupère les ingrédients de la liste
    const ingredientTags = document.querySelectorAll('.ingredient-tag');
    const ingredients = Array.from(ingredientTags).map(tag => tag.textContent);

    if (ingredients.length === 0) {
        alert('Veuillez sélectionner au moins un ingrédient !');
        return;
    }

    // 2. On affiche l'état de chargement
    getRecipeBtn.textContent = 'Génération en cours...';
    getRecipeBtn.disabled = true;
    resultSection.innerHTML = '<p>Préparation de la recette...</p>';
    resultSection.classList.remove('hidden');

    // 3. Appel de l'IA (le vrai !)
    try {
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: ingredients.join(', ') })
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
        getRecipeBtn.textContent = 'Générer ma recette';
        getRecipeBtn.disabled = false;
    }
});


// Fonction pour afficher les ingrédients reconnus
function displayRecognizedIngredients(ingredients) {
    ingredientsList.innerHTML = '';
    ingredients.forEach(ingredient => {
        const tag = document.createElement('span');
        tag.className = 'ingredient-tag';
        tag.textContent = ingredient;
        
        // Permet à l'utilisateur de supprimer un ingrédient
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag-btn';
        removeBtn.textContent = 'x';
        removeBtn.addEventListener('click', () => {
            tag.remove();
        });
        
        tag.appendChild(removeBtn);
        ingredientsList.appendChild(tag);
    });
}

// Fonction pour afficher la recette sur la page
function displayRecipe(recipe) {
    // On réinitialise l'état du bouton
    getRecipeBtn.textContent = 'Générer ma recette';
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