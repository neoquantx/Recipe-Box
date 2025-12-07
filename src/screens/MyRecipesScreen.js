import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RecipeCard from "../components/RecipeCard";
import { loadRecipes } from "../storage/storage";

export default function MyRecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const stored = await loadRecipes();
        setRecipes(stored || []);
      })();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>
      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes yet. Add one to get started!</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddRecipe")}
          >
            <Text style={styles.addButtonText}>Add Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
            />
          )}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", padding: 12, paddingTop: 20 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666", marginBottom: 20 },
  addButton: { backgroundColor: "#FF6B6B", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "bold" }
});
