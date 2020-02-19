import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Loading from "./../components/Loading";
import { NavigationEvents } from "react-navigation";
import { firebaseApp } from "./../utils/Firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const { navigation } = props;

  const toastRef = useRef();

  const [restaurants, setRestaurants] = useState(null);
  const [reloadRestaurants, setReloadRestaurants] = useState(false);
  const [isVisibleLoading, setIsVisibleLoading] = useState(false);
  const [userLogged, setUserLogged] = useState(false);

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    if (userLogged) {
      const idUser = firebase.auth().currentUser.uid;

      db.collection("favorites")
        .where("idUser", "==", idUser)
        .get()
        .then(response => {
          const idRestaurants = [];
          response.forEach(doc => idRestaurants.push(doc.data().idRestaurant));

          getDataRestaurant(idRestaurants).then(response => {
            const restaurants = [];
            response.forEach(doc => {
              let restaurant = doc.data();
              restaurant.id = doc.id;
              restaurants.push(restaurant);
            });
            setRestaurants(restaurants);
          });
        });
    }
    setReloadRestaurants(false);
  }, [reloadRestaurants]);

  const getDataRestaurant = idRestaurants => {
    const arrayRestaurants = [];
    idRestaurants.forEach(idRestaurant => {
      const result = db
        .collection("restaurants")
        .doc(idRestaurant)
        .get();

      arrayRestaurants.push(result);
    });

    return Promise.all(arrayRestaurants);
  };

  if (!userLogged)
    return (
      <UserNotLogged
        setReloadRestaurants={setReloadRestaurants}
        navigation={navigation}
      />
    );

  if (restaurants && restaurants.length === 0)
    return <NotFoundRestaurants setReloadRestaurants={setReloadRestaurants} />;

  return (
    <View style={styles.viewBody}>
      <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
      {restaurants ? (
        <FlatList
          data={restaurants}
          renderItem={restaurant => (
            <Restaurant
              restaurant={restaurant}
              navigation={navigation}
              setIsVisibleLoading={setIsVisibleLoading}
              setReloadRestaurants={setReloadRestaurants}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large" />
          <Text>Cargando restaurantes</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={1} />
      <Loading isVisible={isVisibleLoading} text="Eliminando Restaurante" />
    </View>
  );
}

function Restaurant(props) {
  const {
    restaurant,
    navigation,
    setIsVisibleLoading,
    setReloadRestaurants,
    toastRef
  } = props;
  const { id, name, images } = restaurant.item;

  const [imageRestaurant, setImageRestaurant] = useState(null);

  useEffect(() => {
    const image = images[0];
    firebase
      .storage()
      .ref(`restaurants/${image}`)
      .getDownloadURL()
      .then(url => {
        setImageRestaurant(url);
      });
  }, []);

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar restaurante de favoritos",
      "¿Estas seguro que quieres eliminar el restaurante de favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: removeFavorite
        }
      ],
      {
        cancelable: false
      }
    );
  };

  const removeFavorite = () => {
    setIsVisibleLoading(true);
    db.collection("favorites")
      .where("idRestaurant", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then(response => {
        response.forEach(doc => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsVisibleLoading(false);
              setReloadRestaurants(true);
              toastRef.current.show("Restaurante eliminado correctamente");
            })
            .catch(() => {
              toastRef.current.show(
                "Error al eliminar el restaurante, intentelo más tarde"
              );
            });
        });
      });
  };

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Restaurant", { restaurant: restaurant.item });
        }}
      >
        <Image
          resizeMode="cover"
          source={{ uri: imageRestaurant }}
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#FFFFFF" />}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Icon
          type="material-community"
          name="heart"
          color="#00a680"
          containerStyle={styles.favorite}
          onPress={confirmRemoveFavorite}
          size={40}
          underlayColor="transparent"
        />
      </View>
    </View>
  );
}

function NotFoundRestaurants(props) {
  const { setReloadRestaurants } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        No tienes restaurantes en tu lista
      </Text>
    </View>
  );
}

function UserNotLogged(props) {
  const { setReloadRestaurants, navigation } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Necesitas estar logeado para ver esta sección.
      </Text>
      <Button
        title="Ir al login"
        onPress={() => navigation.navigate("Login")}
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#00a680" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center"
  },
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  restaurant: {
    margin: 10
  },
  image: {
    width: "100%",
    height: 180
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#FFFFFF"
  },
  name: {
    fontWeight: "bold",
    fontSize: 20
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 100
  }
});
