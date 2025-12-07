import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={ recipe.image ? { uri: recipe.image } : require("../../assets/placeholder.png") }
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>{recipe.time} • {recipe.servings} servings</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", marginVertical: 8, backgroundColor: "#fff", borderRadius: 8, elevation: 2, overflow: "hidden" },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 10, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { marginTop: 6, color: "#666" }
});
