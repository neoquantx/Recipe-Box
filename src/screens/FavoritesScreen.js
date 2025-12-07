import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import RecipeCard from "../components/RecipeCard";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const favoritesRef = collection(db, "users", user.uid, "favorites");
          const snapshot = await getDocs(favoritesRef);
          const favList = snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
          setFavorites(favList);
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      })();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite recipes yet. Add some!</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.exploreButtonText}>Explore Recipes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.docId}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.recipeId })}
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
  exploreButton: { backgroundColor: "#4FD366", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  exploreButtonText: { color: "#fff", fontWeight: "bold" }
});
