import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";
import ListTopRestaurants from "./../components/Ranking/ListTopRestaurants";

import { firebaseApp } from "./../utils/Firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function TopRestaurants(props) {
  const { navigation } = props;

  const toastRef = useRef();

  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    (async () => {
      db.collection("restaurants")
        .orderBy("rating", "desc")
        .limit(5)
        .get()
        .then(response => {
          const arrayRestaurants = [];
          response.forEach(doc => {
            let restaurant = doc.data();
            restaurant.id = doc.id;
            arrayRestaurants.push(restaurant);
          });
          setRestaurants(arrayRestaurants);
        })
        .catch(() => {
          toastRef.current.show(
            "Error al cargar el Ranking, intentelo más tarde"
          );
        });
    })();
  }, []);

  return (
    <View>
      <ListTopRestaurants restaurants={restaurants} navigation={navigation} />
      <Toast ref={toastRef} position="center" opacity={0.7} />
    </View>
  );
}
