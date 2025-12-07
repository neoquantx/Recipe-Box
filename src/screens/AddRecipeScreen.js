import React, { useState } from "react";
import { View, TextInput, Button, ScrollView, Text, Alert, StyleSheet, TouchableOpacity, Image } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import * as ImagePicker from 'expo-image-picker';

export default function AddRecipeScreen({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState(""); // newline separated
  const [steps, setSteps] = useState("");
  const [time, setTime] = useState("");
  const [servings, setServings] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert("Permission Required", "Camera permission is required to take photos");
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert("Permission Required", "Gallery permission is required to select photos");
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Recipe Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => pickImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const onSave = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Please enter a title");

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add a recipe");
      return;
    }

    const newRecipe = {
      id: Date.now().toString(),
      title: title.trim(),
      ingredients: ingredients.split("\n").map(s => s.trim()).filter(Boolean),
      steps: steps.split("\n").map(s => s.trim()).filter(Boolean),
      time: time || "N/A",
      servings: servings || "N/A",
      image: imageUri,
      favorite: false
    };

    try {
      const userRecipesRef = collection(db, "users", user.uid, "recipes");
      await addDoc(userRecipesRef, newRecipe);
      Alert.alert("Saved", "Recipe added successfully");
      // if parent passed onSave callback
      if (route.params && route.params.onSave) {
        try { await route.params.onSave(newRecipe); } catch(e){/*ignore*/ }
      }
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error adding recipe:", error);
      Alert.alert("Error", "Failed to add recipe");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Image Upload Section */}
        <TouchableOpacity style={styles.imageUploadContainer} onPress={showImageOptions}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.uploadText}>Add Recipe Photo</Text>
              <Text style={styles.uploadSubtext}>Tap to take photo or choose from gallery</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {imageUri && (
          <TouchableOpacity style={styles.changeImageButton} onPress={showImageOptions}>
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        )}

        <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Ingredients (one per line)</Text>
        <TextInput multiline placeholder="e.g. 1 cup rice" style={[styles.input, {height:120}]} value={ingredients} onChangeText={setIngredients} />
        <Text style={styles.label}>Steps (one per line)</Text>
        <TextInput multiline placeholder="Step 1" style={[styles.input, {height:150}]} value={steps} onChangeText={setSteps} />
        <TextInput placeholder="Time (e.g. 30 mins)" style={styles.input} value={time} onChangeText={setTime} />
        <TextInput placeholder="Servings (e.g. 2)" style={styles.input} value={servings} onChangeText={setServings} />
        
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    padding: 16,
  },
  imageUploadContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  changeImageButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  input: { 
    marginVertical: 8, 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 14,
  },
  label: { 
    marginTop: 6, 
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
