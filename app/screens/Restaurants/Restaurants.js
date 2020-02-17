import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import ActionButton from "react-native-action-button";
import ListRestaurants from "./../../components/Restaurants/ListRestaurants";

import { firebaseApp } from "./../../utils/Firebase";
import * as firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Restaurants(props) {
  const limitRestaurants = 8;

  const { navigation } = props;

  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState(null);
  const [startRestaurants, setStartRestaurants] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [isReloadRestaurants, setIsReloadRestaurants] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(userInfo => {
      setUser(userInfo);
    });
  }, []);

  useEffect(() => {
    console.log("RELOAD");
    db.collection("restaurants")
      .get()
      .then(snap => {
        console.log("SIZE ==> ", snap.size);
        setTotalRestaurants(snap.size);
      });

    (async () => {
      const resultRestaurants = [];
      const restaurants = db
        .collection("restaurants")
        .orderBy("createAt", "desc")
        .limit(limitRestaurants);

      await restaurants.get().then(response => {
        setStartRestaurants(response.docs.length - 1);

        response.forEach(doc => {
          const restaurant = Object.assign({}, { id: doc.id }, doc.data());
          resultRestaurants.push({ restaurant });
        });

        setRestaurants(resultRestaurants);
      });
    })();
    setIsReloadRestaurants(false);
  }, [isReloadRestaurants]);

  const handleLoadMore = async () => {
    console.log("===> YEEEESSSS <===");

    const resultRestaurants = [];
    restaurants.length < totalRestaurants && setIsLoading(true);

    const restaurantsDb = db
      .collection("restaurants")
      .orderBy("createAt", "desc")
      .startAfter(startRestaurants.data().createAt)
      .limit(limitRestaurants);

    await restaurantsDb.get().then(response => {
      console.log(response);
      if (response.docs.length > 0) {
        setStartRestaurants(response.docs[response.docs.length - 1]);
      } else {
        setIsLoading(false);
      }

      response.forEach(doc => {
        const restaurant = Object.assign({}, { id: doc.id }, doc.data());
        resultRestaurants.push(restaurant);
      });

      setRestaurants([...restaurants, ...resultRestaurants]);
    });
  };

  return (
    <View style={styles.viewBody}>
      <ListRestaurants
        restaurants={restaurants}
        isLoading={isLoading}
        handleLoadMore={handleLoadMore}
      />

      {user && (
        <AddRestaurantButton
          navigation={navigation}
          setIsReloadRestaurants={setIsReloadRestaurants}
        />
      )}
    </View>
  );
}

function AddRestaurantButton(props) {
  const { navigation, setIsReloadRestaurants } = props;

  return (
    <ActionButton
      buttonColor="#00a680"
      onPress={() =>
        navigation.navigate("AddRestaurant", { setIsReloadRestaurants })
      }
    />
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  }
});
