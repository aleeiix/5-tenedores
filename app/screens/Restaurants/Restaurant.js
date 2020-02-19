import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, ScrollView, Text, View, Dimensions } from "react-native";
import { Rating, ListItem, Icon } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Carousel from "./../../components/Carousel";
import Map from "./../../components/Map";
import ListReviews from "./../../components/Restaurants/ListReviews";

import { firebaseApp } from "./../../utils/Firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const screenWidth = Dimensions.get("window").width;

export default function Restaurant(props) {
  const { navigation } = props;
  const { restaurant } = navigation.state.params;

  const toastRef = useRef();

  const [imagesRestaurant, setImagesRestaurant] = useState([]);
  const [rating, setRating] = useState(restaurant.rating);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLogged, setUserLogged] = useState(false);

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    const urls = [];

    (async () => {
      await Promise.all(
        restaurant.images.map(async idImage => {
          await firebase
            .storage()
            .ref(`restaurants/${idImage}`)
            .getDownloadURL()
            .then(imageUrl => urls.push(imageUrl));
        })
      );

      setImagesRestaurant(urls);
    })();
  }, []);

  useEffect(() => {
    if (userLogged) {
      db.collection("favorites")
        .where("idRestaurant", "==", restaurant.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then(response => {
          if (response.docs.length === 1) {
            setIsFavorite(true);
          }
        });
    }
  }, []);

  const addFavorite = () => {
    if (userLogged) {
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idRestaurant: restaurant.id
      };

      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show("Restaurante añadido a la lista de favoritos");
        })
        .catch(() => {
          toastRef.current.show(
            "Error al añadir el restaurante a la lista de favoritos, intentelo más tarde"
          );
        });
    } else {
      toastRef.current.show(
        "Para usar el sistema de favoritos es necesario estar logeado"
      );
    }
  };

  const removeFavorite = () => {
    if (userLogged) {
      db.collection("favorites")
        .where("idRestaurant", "==", restaurant.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then(response => {
          response.docs.forEach(doc => {
            const idFavorite = doc.id;
            db.collection("favorites")
              .doc(idFavorite)
              .delete()
              .then(() => {
                setIsFavorite(false);
                toastRef.current.show(
                  "Restaurante eliminado de la lista de favoritos"
                );
              })
              .catch(() => {
                toastRef.current.show(
                  "No se ha podido eliminar el restaurante de la lista de favoritos, intentelo más tarde"
                );
              });
          });
        });
    } else {
      toastRef.current.show(
        "Para usar el sistema de favoritos es necesario estar logeado"
      );
    }
  };

  return (
    <ScrollView style={styles.viewBody}>
      <View style={styles.viewFavorite}>
        <Icon
          type="material-community"
          name={isFavorite ? "heart" : "heart-outline"}
          onPress={isFavorite ? removeFavorite : addFavorite}
          color={isFavorite ? "#00a680" : "#000000"}
          size={35}
          underlayColor="transparent"
        />
      </View>
      <Carousel images={imagesRestaurant} width={screenWidth} height={200} />
      <TitleRestaurant
        name={restaurant.name}
        description={restaurant.description}
        rating={rating}
      />
      <RestaurantInfo
        location={restaurant.location}
        name={restaurant.name}
        address={restaurant.address}
        phone={restaurant.phone}
        email={restaurant.email}
      />

      <ListReviews
        navigation={navigation}
        idRestaurant={restaurant.id}
        setRating={setRating}
      />

      <Toast ref={toastRef} position="center" opacity={0.5} />
    </ScrollView>
  );
}

function TitleRestaurant(props) {
  const { name, description, rating } = props;

  return (
    <View style={styles.viewRestaurantTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameRestaurant}>{name}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
          //   tintColor="transparent"
        />
      </View>
      <Text style={styles.descriptionRestaurant}>{description}</Text>
    </View>
  );
}

function RestaurantInfo(props) {
  const { location, name, address, phone, email } = props;

  const listInfo = [
    {
      text: address || null,
      iconName: "map-marker",
      iconType: "material-community",
      action: null
    },
    {
      text: phone || null,
      iconName: "phone",
      iconType: "material-community",
      action: null
    },
    {
      text: email || null,
      iconName: "at",
      iconType: "material-community",
      action: null
    }
  ];

  return (
    <View style={styles.viewRestaurantInfo}>
      <Text style={styles.restaurantInfoTitle}>
        Información sobre el restaurante
      </Text>
      <Map location={location} name={name} height={100} />
      {listInfo.map((item, index) => {
        if (item.text) {
          return (
            <ListItem
              key={index}
              title={item.text}
              leftIcon={{
                name: item.iconName,
                type: item.iconType,
                color: "#00a680"
              }}
              containerStyle={styles.containerListItem}
            />
          );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewFavorite: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 5
  },
  viewRestaurantTitle: {
    margin: 15
  },
  nameRestaurant: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  descriptionRestaurant: {
    marginTop: 5,
    color: "grey"
  },
  viewRestaurantInfo: {
    margin: 15,
    marginTop: 25
  },
  restaurantInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1
  }
});
