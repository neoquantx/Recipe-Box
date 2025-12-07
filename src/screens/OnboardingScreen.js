import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: '1',
    title: 'Find Your Next Favorite Meal',
    description: 'Discover thousands of delicious recipes from around the world to inspire your cooking.',
    image: require('../../assets/placeholder.png'),
  },
  {
    id: '2',
    title: 'Save Your Favorites',
    description: 'Bookmark recipes you love and create your own personalized cookbook.',
    image: require('../../assets/placeholder.png'),
  },
  {
    id: '3',
    title: 'Create Your Own Recipe',
    description: 'Add your own recipes with photos and steps, and build a personal cookbook.',
    image: require('../../assets/placeholder.png'),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Signup");
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Skip */}
      <View style={styles.header}>
        <Text style={styles.headerSpace}></Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
                key={index.toString()}
              />
            );
          })}
        </View>

        {/* Get Started / Next Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={scrollToNext}
        >
          <Text style={styles.getStartedText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerSpace: {
    width: 50,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  sliderContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
  },
  imageContainer: {
    height: 280,
    width: width - 40,
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 20,
    marginHorizontal: 20,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
    marginHorizontal: 5,
  },
  getStartedButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666666",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
});
