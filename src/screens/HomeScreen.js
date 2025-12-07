import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import sampleRecipes from "../data/sampleRecipes";
import RecipeCard from "../components/RecipeCard";
import { loadRecipes, saveRecipes } from "../storage/storage";
import { AuthContext } from "../context/AuthContext";
import { fetchRecipesFromAPI } from "../data/recipeApi";

export default function HomeScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const { signOut, state } = useContext(AuthContext);
  const [userName, setUserName] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const stored = await loadRecipes();
        if (stored && stored.length) {
          setRecipes(stored);
        } else {
          // initialize with sample
          await saveRecipes(sampleRecipes);
          setRecipes(sampleRecipes);
        }
        
        // Get username from state or AsyncStorage
        if (state?.user?.fullName) {
          setUserName(state.user.fullName);
        } else {
          const storedName = await AsyncStorage.getItem("userName");
          if (storedName) {
            setUserName(storedName);
          }
        }
      })();
    }, [state])
  );

  // navigate to detail
  const openRecipe = (item) => navigation.navigate("RecipeDetail", { recipeId: item.id });

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleSearchPress = () => {
    navigation.navigate("Search", { recipes });
  };

  const categories = [
    { name: "Italian", type: "area", icon: "🍝" },
    { name: "Chinese", type: "area", icon: "🥢" },
    { name: "Indian", type: "area", icon: "🍛" },
    { name: "Mexican", type: "area", icon: "🌮" },
    { name: "American", type: "area", icon: "🍔" },
    { name: "French", type: "area", icon: "🥐" },
    { name: "Japanese", type: "area", icon: "🍱" },
    { name: "Thai", type: "area", icon: "🍜" },
    { name: "Greek", type: "area", icon: "🥙" },
    { name: "Spanish", type: "area", icon: "🥘" },
    { name: "Breakfast", type: "category", icon: "🍳" },
    { name: "Dessert", type: "category", icon: "🍰" },
    { name: "Vegetarian", type: "category", icon: "🥗" },
    { name: "Seafood", type: "category", icon: "🦐" },
    { name: "Chicken", type: "category", icon: "🍗" },
    { name: "Beef", type: "category", icon: "🥩" },
    { name: "Pasta", type: "category", icon: "🍝" },
    { name: "Vegan", type: "category", icon: "🌱" },
  ];

  const handleCategoryPress = async (item) => {
    try {
      const apiRecipes = await fetchRecipesFromAPI(item.name, item.type);
      
      if (apiRecipes.length === 0) {
        Alert.alert("No recipes found", `No recipes found for ${item.name}`);
        return;
      }
      
      navigation.navigate("Search", { recipes: apiRecipes, isApi: true });
    } catch (error) {
      Alert.alert("Error", "Failed to fetch recipes. Please try again.");
      console.error("Category search error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Hello! {userName || "Guest"}</Text>
          <Text style={styles.subtitleText}>Find your favorite recipe</Text>
        </View>

        {/* Header with Search and Profile */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search for recipes...</Text>
        </TouchableOpacity>

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryCard} 
              onPress={() => handleCategoryPress(item)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Search", { recipes })}>
          <Text style={styles.navIcon}>🔎</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Favorites")}>
          <Text style={styles.navIcon}>💖</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("AddRecipe")}>
          <Text style={styles.navIcon}>✨</Text>
          <Text style={styles.navLabel}>Add New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MyRecipes")}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navLabel}>My Recipes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F5F2",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#F0F5F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#A8D5BA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginHorizontal: 24,
    marginBottom: 12,
  },
  trendingContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  trendingCard: {
    flexDirection: "row",
    backgroundColor: "#F0F5F2",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
  },
  trendingImage: {
    width: 100,
    height: 100,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  trendingImageText: {
    fontSize: 40,
  },
  trendingDetails: {
    flex: 1,
    paddingHorizontal: 16,
  },
  trendingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  trendingTime: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666666",
  },
  heartButton: {
    paddingHorizontal: 16,
  },
  heartIcon: {
    fontSize: 18,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    marginBottom: 80,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#F0F5F2",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F5F2",
    paddingVertical: 12,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
});
