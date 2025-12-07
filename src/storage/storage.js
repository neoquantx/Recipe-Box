import { db, auth } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export async function saveRecipes(recipes) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRecipesRef = collection(db, "users", user.uid, "recipes");

    // Clear existing and add new
    const existing = await getDocs(userRecipesRef);
    const deletePromises = existing.docs.map((snap) => deleteDoc(snap.ref));
    await Promise.all(deletePromises);

    for (const recipe of recipes) {
      await addDoc(userRecipesRef, recipe);
    }
  } catch (e) {
    console.error("saveRecipes error", e);
  }
}

export async function loadRecipes() {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userRecipesRef = collection(db, "users", user.uid, "recipes");
    const snapshot = await getDocs(userRecipesRef);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("loadRecipes error", e);
    return null;
  }
}

export async function saveFavorite(recipe) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    // Add favorite with recipe id as document ID
    await addDoc(favoritesRef, {
      recipeId: recipe.id,
      title: recipe.title,
      image: recipe.image,
      time: recipe.time,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      savedAt: new Date()
    });
  } catch (e) {
    console.error("saveFavorite error", e);
  }
}

export async function removeFavorite(recipeId) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const snapshot = await getDocs(favoritesRef);
    const favoriteDoc = snapshot.docs.find(d => d.data().recipeId === recipeId);
    if (favoriteDoc) {
      await deleteDoc(favoriteDoc.ref);
    }
  } catch (e) {
    console.error("removeFavorite error", e);
  }
}

export async function isFavorite(recipeId) {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const snapshot = await getDocs(favoritesRef);
    return snapshot.docs.some(d => d.data().recipeId === recipeId);
  } catch (e) {
    console.error("isFavorite error", e);
    return false;
  }
}
