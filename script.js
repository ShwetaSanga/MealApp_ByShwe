// Get elements from the HTML
const searchcontrol = document.querySelector('.search-control');
const searchbtn = document.querySelector('#search-btn');
const Mealresult = document.querySelector('.Meal-result');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-btn');
const favouriteDetails = document.querySelector('.favourite-details');
const favouriteDetailsContent = document.querySelector('.favourite-details-content');
const favouriteCloseBtn = document.querySelector('.favourite-close-btn');

// Function to fetch meal
const fetchRecipes = async (query) => {
  Mealresult.innerHTML = "<h2 style='color: orange;'>Fetching Recipes...</h2>";
  try {
    const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const response = await data.json();
    Mealresult.innerHTML = "";
    if (response.meals) {
      response.meals.forEach((meal) => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.setAttribute('data-meal-id', meal.idMeal);
        recipeDiv.innerHTML = `
          <img src="${meal.strMealThumb}">
          <h3>${meal.strMeal}</h3>
          <p style="color: white;"><span>${meal.strArea}</span> Dish</p>
          <p style="color: white;">Belongs to <span>${meal.strCategory}</span> Category</p>
        `;
        const button1 = document.createElement('button');
        button1.textContent = 'View Details';
        button1.classList.add('button1'); // Add the "button1" class to the button
        recipeDiv.appendChild(button1);

        const button2 = document.createElement('button');
        button2.textContent = 'Add to Favourite';
        button2.classList.add('button2'); // Add the "button2" class to the button
        recipeDiv.appendChild(button2);

        // Adding EventListener to meal button
        button1.addEventListener('click', () => {
          openRecipePopup(meal);
        });

        // Adding EventListener to add to favourite button
        button2.addEventListener('click', () => {
          addToFavourites(meal.idMeal);
          alert("Your meal added to your favorites list");
        });

        Mealresult.appendChild(recipeDiv);
      });
    } else {
      Mealresult.innerHTML = "<p><h1 style='color: orange;'>No Recipes Found...</h1></p>";
    }
  } catch (error) {
    Mealresult.innerHTML = "<p><h1 style='color: orange;'>Error...</h1></p><p><h3 style='color: orange;'> Oops, Something went wrong. Please try searching with Correct Meal Name.</h3></p>";
  }
};

// Function to fetch ingredients for a meal
const fetchIngredients = (meal) => {
  let ingredientsList = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient) {
      const measure = meal[`strMeasure${i}`];
      ingredientsList += `<li>${measure} ${ingredient}</li>`;
    } else {
      break;
    }
  }
  return ingredientsList;
};

// Function to open meal popup
const openRecipePopup = (meal) => {
  recipeDetailsContent.innerHTML = `
    <h2 class="recipeName">${meal.strMeal}</h2>
    <div class="meal-thumbail">
      <img src="${meal.strMealThumb}" alt="" srcset="">
    </div>
    <h3>Ingredients:</h3>
    <ul class="ingredientsList">${fetchIngredients(meal)}</ul>
    <div class="recipeInstructions">
      <h3> Instructions:</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <div class="text-center">
      <a href="${meal.strYoutube}" target="_blank" class="button3">Watch Video</a>
    </div>
  `;
  recipeDetailsContent.parentElement.style.display = 'block';
};

// Event listener for closing the meal popup
recipeCloseBtn.addEventListener('click', () => {
  recipeDetailsContent.parentElement.style.display = 'none';
});

// Function to add a meal to favourites
const addToFavourites = (mealId) => {
  const favourites = getFavourites();
  favourites.push(mealId);
  saveFavourites(favourites);
  showFavouriteMeals();
};

// Function to remove a meal from favourites
const removeFromFavourites = (mealId) => {
  const favourites = getFavourites();
  const updatedFavourites = favourites.filter((id) => id !== mealId);
  saveFavourites(updatedFavourites);
  showFavouriteMeals();
};

// Function to get favourite meals from local storage
const getFavourites = () => {
  const favouritesJSON = localStorage.getItem('favourites');
  return favouritesJSON ? JSON.parse(favouritesJSON) : [];
};

// Function to save favourite meals to local storage
const saveFavourites = (favourites) => {
  localStorage.setItem('favourites', JSON.stringify(favourites));
};

// Function to display favourite meals
const showFavouriteMeals = async () => {
  const favourites = getFavourites();
  favouriteDetailsContent.innerHTML = '';
  let hasFavourites = false;

  for (const mealId of favourites) {
    try {
      const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const response = await data.json();
      const mealData = response.meals[0];
      if (mealData) {
        hasFavourites = true;
        const mealDiv = document.createElement('div');
        mealDiv.classList.add('favourite-meal');
        mealDiv.innerHTML = `
          <img src="${mealData.strMealThumb}">
          <h3>${mealData.strMeal}</h3>
          <button class="remove-btn btn" data-meal-id="${mealData.idMeal}">
            <i class="fas fa-heart"></i> Remove from Favourites
          </button>
        `;
        const removeBtn = mealDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
          removeFromFavourites(mealData.idMeal);
          alert("Your meal removed from your favorites list");
        });
        favouriteDetailsContent.appendChild(mealDiv);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!hasFavourites) {
    favouriteDetailsContent.innerHTML = '<p style="color: orange;">You have no favourite meals yet.</p>';
  }
};

// Event listener for showing the favourite meals list
favouriteCloseBtn.addEventListener('click', () => {
  favouriteDetails.style.display = 'none';
});

// Function to show favourite meals list
const showFavMealList = () => {
  favouriteDetails.style.display = 'block';
  showFavouriteMeals();
};

// Event listener for searching recipes
searchbtn.addEventListener('click', (e) => {
  e.preventDefault();
  const searchInput = searchcontrol.value.trim();
  if (!searchInput) {
    Mealresult.innerHTML = `<h2 style='color: orange;'>Type Your Meal Name in the Search Box...</h2>`;
    return;
  }
  fetchRecipes(searchInput);
});

// Load favourite meals on page load
document.addEventListener('DOMContentLoaded', () => {
  showFavouriteMeals();
});


