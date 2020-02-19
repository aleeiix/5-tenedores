import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";

export default function ListReviews(props) {
  const { navigation, idRestaurant } = props;

  return (
    <View>
      <Button
        buttonStyle={styles.btnAddReview}
        titleStyle={styles.btnTitleAddReview}
        title="Escribir una opinion"
        icon={{
          type: "material-community",
          name: "square-edit-outline",
          color: "#00a680"
        }}
        onPress={() => {
          navigation.navigate("AddReviewRestaurant", { idRestaurant });
        }}
      />
      <Text>Lista de comentarios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent"
  },
  btnTitleAddReview: {
    color: "#00a680"
  }
});
