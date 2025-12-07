// Utility to fetch recipes from TheMealDB API (free, no key needed)

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Helper function to estimate cooking time based on instructions
function estimateCookingTime(instructions) {
  if (!instructions) return "30 mins";
  const length = instructions.length;
  if (length < 200) return "15 mins";
  if (length < 500) return "30 mins";
  if (length < 1000) return "45 mins";
  return "60 mins";
}

// Helper function to estimate servings based on number of ingredients
function estimateServings(ingredients) {
  const count = ingredients.length;
  if (count < 3) return "1";
  if (count < 6) return "2";
  if (count < 10) return "4";
  return "6";
}

export async function fetchRecipesFromAPI(query, type = 'search') {
  try {
    let url;
    if (type === 'category') {
      url = `${BASE_URL}/filter.php?c=${encodeURIComponent(query)}`;
    } else if (type === 'area') {
      url = `${BASE_URL}/filter.php?a=${encodeURIComponent(query)}`;
    } else {
      // Search by name
      url = `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    // Map to app's recipe format
    const meals = data.meals || [];
    // Fetch detailed info for first 10 meals (including ingredients)
    const detailedMeals = await Promise.all(
      meals.slice(0, 10).map(m => fetchRecipeById(m.idMeal))
    );
    return detailedMeals.filter(m => m !== null);
  } catch (e) {
    console.error("fetchRecipesFromAPI error", e);
    return [];
  }
}

export async function fetchRecipeById(id) {
  try {
    const url = `${BASE_URL}/lookup.php?i=${id}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const meal = data.meals?.[0];
    if (!meal) return null;
    // Parse ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(`${measure} ${ing}`.trim());
      }
    }
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      summary: meal.strInstructions,
      ingredients,
      steps: meal.strInstructions ? meal.strInstructions.split(/\r\n|\r|\n/).filter(s => s.trim()) : [],
      time: estimateCookingTime(meal.strInstructions),
      servings: estimateServings(ingredients),
      favorite: false
    };
  } catch (e) {
    console.error("fetchRecipeById error", e);
    return null;
  }
}
