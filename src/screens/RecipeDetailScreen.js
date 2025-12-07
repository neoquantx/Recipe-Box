import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import sampleRecipes from "../data/sampleRecipes";
import { loadRecipes, saveRecipes, saveFavorite, removeFavorite, isFavorite } from "../storage/storage";
import { fetchRecipeById } from "../data/recipeApi";

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadRecipes();
      const list = stored && stored.length ? stored : sampleRecipes;
      setAllRecipes(list);
      let found = list.find(r => r.id === recipeId);
      if (!found && !isNaN(recipeId)) {
        // Try to fetch from API
        found = await fetchRecipeById(recipeId);
      }
      if (found) {
        setRecipe(found);
        // Check if recipe is in favorites
        const favStatus = await isFavorite(found.id);
        setIsFav(favStatus);
      }
    })();
  }, [recipeId]);

  const toggleFavorite = async () => {
    if (!recipe) return;
    try {
      if (isFav) {
        await removeFavorite(recipe.id);
        setIsFav(false);
        Alert.alert("Removed", "Recipe removed from favorites");
      } else {
        await saveFavorite(recipe);
        setIsFav(true);
        Alert.alert("Added", "Recipe marked as favorite");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update favorite");
    }
  };

  if (!recipe) return <View style={{ flex:1, justifyContent: "center", alignItems: "center" }}><Text>Recipe not found</Text></View>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={ recipe.image ? { uri: recipe.image } : require("../../assets/placeholder.png") }
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.headerRow}>
        <Text style={styles.title}>{recipe.title}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
          <Text style={styles.favIcon}>{isFav ? "★" : "☆"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.meta}>{recipe.time} • {recipe.servings} servings</Text>

      <Text style={styles.heading}>Ingredients</Text>
      {recipe.ingredients.map((ing, i) => (
        <Text key={i} style={styles.line}>• {ing}</Text>
      ))}

      <Text style={styles.heading}>Steps</Text>
      {recipe.steps.map((s, i) => (
        <Text key={i} style={styles.line}>{i+1}. {s}</Text>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
  image: { width: "100%", height: 260, borderRadius: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#000" },
  favBtn: { padding: 8, borderRadius: 8 },
  favIcon: { fontSize: 22 },
  meta: { color: "#666", marginTop: 8 },
  heading: { marginTop: 16, fontSize: 18, fontWeight: "700", color: "#000" },
  line: { marginTop: 8, fontSize: 15, color: "#333", lineHeight: 22 },
});
