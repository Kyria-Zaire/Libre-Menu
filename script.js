// ---------- REFS ----------
const imageUpload     = document.getElementById('image-upload');
const previewContainer= document.getElementById('image-preview-container');
const imagePreview    = document.getElementById('image-preview');
const ingrSection     = document.getElementById('ingredients-recognition-section');
const ingrList        = document.getElementById('ingredients-list');
const resultSection   = document.getElementById('result-section');
const getRecipeBtn    = document.getElementById('get-recipe-btn');
const resetBtn        = document.getElementById('reset-btn');

// ---------- UPLOAD ----------
imageUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    imagePreview.src = ev.target.result;
    previewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);

  ingrSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  resetBtn.classList.add('hidden');
  getRecipeBtn.classList.remove('hidden');
});

// ---------- GÉNÉRER RECETTE ----------
getRecipeBtn.addEventListener('click', async () => {
  const file = imageUpload.files[0];
  if (!file) return;

  resultSection.classList.remove('hidden');
  resultSection.innerHTML = '<p>Analyse de votre image et génération de la recette...</p>';
  getRecipeBtn.classList.add('hidden');

  try {
    const base64Image = await toBase64(file);
    const res = await fetch('/api/recipe', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ image: base64Image })
    });
    if (!res.ok) throw new Error('Erreur serveur');

    const data = await res.json();
    displayRecognizedIngredients(data.recognizedIngredients);
    displayRecipe(data.recipe);

    ingrSection.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    resultSection.innerHTML = `<p style="color:red;">Désolé, une erreur est survenue. Veuillez réessayer.</p>`;
    resetBtn.classList.remove('hidden');
  }
});

// ---------- RESET ----------
resetBtn.addEventListener('click', () => {
  imageUpload.value = '';
  previewContainer.classList.add('hidden');
  ingrSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  resetBtn.classList.add('hidden');
  getRecipeBtn.classList.add('hidden');
  resultSection.innerHTML = '';
});

// ---------- UTILS ----------
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
  });
}

function displayRecognizedIngredients(ingredients) {
  ingrList.innerHTML = '';
  ingredients.forEach(i => {
    const tag = document.createElement('span');
    tag.className = 'ingredient-tag';
    tag.textContent = i;
    ingrList.appendChild(tag);
  });
}

function displayRecipe(recipe) {
  const html = `
    <div class="recipe-card">
      <div class="recipe-header">
        <h2>${recipe.name}</h2>
      </div>
      <div class="recipe-body">
        <h3>Ingrédients nécessaires :</h3>
        <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>

        <h3>Liste de courses :</h3>
        ${recipe.shopping_list.length
          ? `<ul>${recipe.shopping_list.map(i => `<li>${i}</li>`).join('')}</ul>`
          : '<p class="shopping-list empty">Rien à acheter, tout est dans le frigo !</p>'}

        <h3>Instructions :</h3>
        <ol>${recipe.instructions.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    </div>`;
  resultSection.innerHTML = html;
}