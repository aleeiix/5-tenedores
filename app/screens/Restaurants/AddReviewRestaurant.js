import React, { useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";
import Toast from "react-native-easy-toast";
import { firebaseApp } from "./../../utils/Firebase";
import firebase from "firebase/app";
import "firebase/firestore";
import Loading from "./../../components/Loading";

const db = firebase.firestore(firebaseApp);

export default function AddReviewRestaurant(props) {
  const { navigation } = props;
  const { idRestaurant, setReviewsReload } = navigation.state.params;

  const toastRef = useRef();

  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState(null);
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addReview = () => {
    if (!rating) {
      toastRef.current.show("No has dado ninguna puntuacion");
    } else if (!title) {
      toastRef.current.show("El titulo es obligatorio");
    } else if (!review) {
      toastRef.current.show("El comentario es obligatorio");
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;
      const payload = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idRestaurant,
        title,
        review,
        rating,
        createAt: new Date()
      };

      db.collection("reviews")
        .add(payload)
        .then(() => {
          updateRestaurant();
        })
        .catch(() => {
          toastRef.current.show(
            "Error al guardar el comentario, intentelo mas tarde"
          );
          setIsLoading(false);
        });
    }
  };

  const updateRestaurant = () => {
    const restaurantRef = db.collection("restaurants").doc(idRestaurant);

    restaurantRef.get().then(response => {
      const restaurantData = response.data();
      const ratingTotal = restaurantData.ratingTotal + rating;
      const quantityVoting = restaurantData.quantityVoting + 1;
      const ratingResult = ratingTotal / quantityVoting;

      restaurantRef
        .update({
          rating: ratingResult,
          ratingTotal,
          quantityVoting
        })
        .then(() => {
          setIsLoading(false);
          setReviewsReload(true);
          navigation.goBack();
        });
    });
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={["Pésimo", "Deficiente", "Normal", "Muy Bueno", "Excelente"]}
          defaultRating={0}
          size={25}
          onFinishRating={value => setRating(value)}
        />
      </View>
      <View style={styles.formReview}>
        <Input
          placeholder="Titulo"
          containerStyle={styles.input}
          onChange={event => setTitle(event.nativeEvent.text)}
        />

        <Input
          placeholder="Comentario"
          multiline={true}
          inputContainerStyle={styles.textarea}
          onChange={event => setReview(event.nativeEvent.text)}
        />

        <Button
          title="Enviar comentario"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addReview}
        />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.5} />
      <Loading isVisible={isLoading} text="Enviando comentario" />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewRating: {
    height: 110,
    backgroundColor: "#f2f2f2"
  },
  formReview: {
    flex: 1,
    alignItems: "center",
    margin: 10,
    marginTop: 40
  },
  input: {
    marginBottom: 10
  },
  textarea: {
    height: 120,
    width: "100%",
    padding: 0,
    margin: 0
  },
  btnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 10,
    width: "95%"
  },
  btn: {
    backgroundColor: "#00a680"
  }
});
