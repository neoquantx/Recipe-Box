
import React, { useState, useMemo } from "react";
import { View, TextInput, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import RecipeCard from "../components/RecipeCard";
import { fetchRecipesFromAPI } from "../data/recipeApi";


export default function SearchScreen({ route, navigation }) {
  const { recipes = [] } = route.params || {};
  const [query, setQuery] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.ingredients && r.ingredients.join(" ").toLowerCase().includes(q))
    );
  }, [query, recipes]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setApiResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const apiData = await fetchRecipesFromAPI(text.trim());
    setApiResults(apiData);
    setLoading(false);
  };


  // Prefix IDs to avoid duplicate keys
  const localResults = filtered.map(r => ({ ...r, _key: `local-${r.id}` }));
  const apiResultsWithKey = apiResults.map(r => ({ ...r, _key: `api-${r.id}` }));
  // Show API results if present, else local
  const combinedResults = apiResultsWithKey.length > 0 ? apiResultsWithKey : localResults;

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        placeholder="Search by name or ingredient..."
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#888" />
      ) : (
        <FlatList
          data={combinedResults}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
            />
          )}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={searched ? <Text style={{ textAlign: "center", marginTop: 20 }}>No recipes found</Text> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { margin: 12, padding: 10, backgroundColor: "#fff", borderRadius: 8 }
});
