import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";
import { firebaseApp } from "./../../utils/Firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function ListReviews(props) {
  const { navigation, idRestaurant, setRating } = props;

  const [reviews, setReviews] = useState([]);
  const [reviewsReload, setReviewsReload] = useState(false);
  const [userLogged, setUserLogged] = useState(false);

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    (async () => {
      const resultReviews = [];
      const arrayRating = [];

      db.collection("reviews")
        .where("idRestaurant", "==", idRestaurant)
        .get()
        .then(response => {
          response.forEach(doc => {
            resultReviews.push(doc.data());
            arrayRating.push(doc.data().rating);
          });

          let numSum = 0;
          arrayRating.map(value => {
            numSum = numSum + value;
          });

          const countRating = arrayRating.length;
          const resultRating = numSum / countRating;
          const resultRatingFinish = resultRating || 0;

          setRating(resultRatingFinish);
          setReviews(resultReviews);
        });

      setReviewsReload(false);
    })();
  }, [reviewsReload]);

  return (
    <View>
      {userLogged ? (
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
            navigation.navigate("AddReviewRestaurant", {
              idRestaurant,
              setReviewsReload
            });
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <Text
            style={{ textAlign: "center", color: "#00a680", padding: 20 }}
            onPress={() => navigation.navigate("Login")}
          >
            Para escribir un comentario es necesarios estar logeado{" "}
            <Text style={{ fontWeight: "bold" }}>
              pulsa AQUI para iniciar sesión
            </Text>
          </Text>
        </View>
      )}

      <FlatList
        data={reviews}
        renderItem={review => <Review review={review} />}
        keyExtractor={(item, index) => {
          index.toString();
        }}
      />
    </View>
  );
}

function Review(props) {
  const defaultAvatar =
    "https://img-cdn.hipertextual.com/files/2020/01/hipertextual-es-figura-baby-yoda-mas-real-que-podras-comprar-2020062519.jpeg?strip=all&lossy=1&quality=55&resize=740%2C490&ssl=1";

  const { title, review, rating, createAt, avatarUser } = props.review.item;
  const createReview = new Date(createAt.seconds * 1000);

  const dateFormated = () => {
    const day = addZero(createReview.getDate());
    const month = addZero(createReview.getMonth() + 1);
    const year = addZero(createReview.getFullYear());
    const hour = addZero(createReview.getHours());
    const minutes = addZero(createReview.getMinutes());

    return `${day}/${month}/${year} - ${hour}:${minutes}`;
  };

  const addZero = number => {
    return number < 10 ? `0${number}` : number;
  };

  return (
    <View style={styles.viewReview}>
      <View style={styles.viewImageAvatar}>
        <Avatar
          size="large"
          rounded
          containerStyle={styles.imageAvatarUser}
          source={{ uri: avatarUser || defaultAvatar }}
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{review}</Text>
        <Rating imageSize={15} startingValue={rating} readonly />
        <Text style={styles.reviewDate}>{dateFormated()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent"
  },
  btnTitleAddReview: {
    color: "#00a680"
  },
  viewReview: {
    flexDirection: "row",
    margin: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1
  },
  viewImageAvatar: {
    marginRight: 15
  },
  imageAvatarUser: {
    width: 50,
    height: 50
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start"
  },
  reviewTitle: {
    fontWeight: "bold"
  },
  reviewText: {
    paddingTop: 2,
    color: "grey",
    marginBottom: 5
  },
  reviewDate: {
    marginTop: 5,
    color: "grey",
    fontSize: 12,
    position: "absolute",
    right: 0,
    bottom: 0
  }
});
