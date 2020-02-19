import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import uuid from "uuid/v4";
import Modal from "./../Modal";

import { firebaseApp } from "./../../utils/Firebase";
import * as firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

const WidthScreen = Dimensions.get("window").width;

export default function AddRestaurantForm(props) {
  const {
    navigation,
    toastRef,
    setIsVisibleLoading,
    setIsReloadRestaurants
  } = props;

  const [imagesSelected, setImagesSelected] = useState([]);

  const [restaurantName, setRestaurantName] = useState(null);
  const [restaurantAddress, setRestaurantAddress] = useState(null);
  const [restaurantPhone, setRestaurantPhone] = useState(null);
  const [restaurantEmail, setRestaurantEmail] = useState(null);
  const [restaurantDescription, setRestaurantDescription] = useState(null);
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [locationRestaurant, setLocationRestaurant] = useState(null);

  const addRestaurant = () => {
    if (
      !restaurantName ||
      !restaurantAddress ||
      !restaurantPhone ||
      !restaurantEmail ||
      !restaurantDescription
    ) {
      toastRef.current.show("Todos los campos del formulario son obligatorios");
    } else if (imagesSelected.length === 0) {
      toastRef.current.show(
        "El restaurante tiene que tener almenos una imagen"
      );
    } else if (!locationRestaurant) {
      toastRef.current.show("Tienes que localizar el restaurante en el mapa");
    } else {
      setIsVisibleLoading(true);
      uploadImagesStorage(imagesSelected).then(arrayImage => {
        db.collection("restaurants")
          .add({
            name: restaurantName,
            address: restaurantAddress,
            phone: restaurantPhone,
            email: restaurantEmail,
            description: restaurantDescription,
            location: locationRestaurant,
            images: arrayImage,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: firebase.auth().currentUser.uid
          })
          .then(() => {
            setIsVisibleLoading(false);
            setIsReloadRestaurants(true);
            navigation.navigate("Restaurants");
          })
          .catch(() => {
            toastRef.current.show(
              "Error al subir el restaurante, intentelo mas tarde"
            );
          });
      });
    }
  };

  const uploadImagesStorage = async imageArray => {
    const imagesBlob = [];
    await Promise.all(
      imageArray.map(async image => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase
          .storage()
          .ref("restaurants")
          .child(uuid());

        await ref.put(blob).then(result => {
          imagesBlob.push(result.metadata.name);
        });
      })
    );
    return imagesBlob;
  };

  return (
    <ScrollView>
      <ImageRestaurant imageRestaurant={imagesSelected[0]} />

      <FormAdd
        setRestaurantName={setRestaurantName}
        setRestaurantAddress={setRestaurantAddress}
        setRestaurantPhone={setRestaurantPhone}
        setRestaurantEmail={setRestaurantEmail}
        setRestaurantDescription={setRestaurantDescription}
        setIsVisibleMap={setIsVisibleMap}
        locationRestaurant={locationRestaurant}
      />

      <UploadImage
        max={5}
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
        toastRef={toastRef}
      />

      <Button
        title="Crear restaurante"
        onPress={addRestaurant}
        buttonStyle={styles.btnAddRestaurant}
      />

      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationRestaurant={setLocationRestaurant}
        toastRef={toastRef}
      />
    </ScrollView>
  );
}

function ImageRestaurant(props) {
  const { imageRestaurant } = props;

  return (
    <View style={styles.viewPhoto}>
      {imageRestaurant ? (
        <Image
          source={{ uri: imageRestaurant }}
          style={{ width: WidthScreen, height: 200 }}
        />
      ) : (
        <Image
          source={require("./../../../assets/img/no-image.png")}
          style={{ width: WidthScreen, height: 200 }}
        />
      )}
    </View>
  );
}

function UploadImage(props) {
  const { max, imagesSelected, setImagesSelected, toastRef } = props;

  const imageSelect = async () => {
    const resultPermission = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    const resultPermissionCamera =
      resultPermission.permissions.cameraRoll.status;

    if (resultPermissionCamera === "denied") {
      toastRef.current.show(
        "Es necesario tener aceptados los permisos de la galeria"
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3]
      });

      if (result.cancelled) {
        toastRef.current.show(
          "Has cerrado la galeria sin seleccionar ninguna imagen"
        );
      } else {
        setImagesSelected([...imagesSelected, result.uri]);
      }
    }
  };

  const removeImage = image => {
    Alert.alert(
      "Eliminar imagen",
      "¿Estas seguro de que quieres eliminar la imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => {
            setImagesSelected(
              imagesSelected.filter(imageSelected => imageSelected !== image)
            );
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viewImages}>
      {imagesSelected.length < max && (
        <Icon
          type="material-community"
          name="camera"
          color="#7A7A7A"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
          underlayColor="transparent"
        />
      )}

      {imagesSelected.map((image, index) => (
        <Avatar
          key={index}
          onPress={() => removeImage(image)}
          style={styles.miniatureStyle}
          source={{ uri: image }}
        />
      ))}
    </View>
  );
}

function FormAdd(props) {
  const {
    setRestaurantName,
    setRestaurantAddress,
    setRestaurantPhone,
    setRestaurantEmail,
    setRestaurantDescription,
    setIsVisibleMap,
    locationRestaurant
  } = props;

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre del restaurante"
        containerStyle={styles.input}
        onChange={e => setRestaurantName(e.nativeEvent.text)}
      />

      <Input
        placeholder="Direccion del restaurante"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationRestaurant ? "#00a680" : "#C2C2C2",
          onPress: () => setIsVisibleMap(true)
        }}
        onChange={e => setRestaurantAddress(e.nativeEvent.text)}
      />

      <Input
        placeholder="Telefono del restaurante"
        containerStyle={styles.input}
        onChange={e => setRestaurantPhone(e.nativeEvent.text)}
      />

      <Input
        placeholder="Email del restaurante"
        containerStyle={styles.input}
        onChange={e => setRestaurantEmail(e.nativeEvent.text)}
      />

      <Input
        placeholder="Descripcion del restaurante"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={e => setRestaurantDescription(e.nativeEvent.text)}
      />
    </View>
  );
}

function Map(props) {
  const {
    isVisibleMap,
    setIsVisibleMap,
    setLocationRestaurant,
    toastRef
  } = props;

  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermission = await Permissions.askAsync(Permissions.LOCATION);
      const statusPermission = resultPermission.permissions.location.status;

      if (statusPermission !== "granted") {
        toastRef.current.show(
          "Tienes que aceptar los permisos de localizacion para crear un restaurante"
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001
        });
      }
    })();
  }, []);

  const confirmLocation = () => {
    setLocationRestaurant(location);
    toastRef.current.show("Localizacion guardada correctamente");
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={region => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              draggable
            ></MapView.Marker>
          </MapView>
        )}
        <View style={styles.viewMapButton}>
          <Button
            title="Guardar ubicacion"
            onPress={confirmLocation}
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
          />
          <Button
            title="Cancelar"
            onPress={() => setIsVisibleMap(false)}
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 10
  },
  viewImages: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 20,
    marginRight: 20,
    marginRight: 20,
    marginTop: 30
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#E3E3E3"
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
    marginBottom: 10
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0
  },
  mapStyle: {
    width: "100%",
    height: 150
  },
  viewMapButton: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  viewMapBtnContainerSave: {
    paddingRight: 5
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680"
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0d"
  },
  btnAddRestaurant: {
    backgroundColor: "#00a680",
    margin: 20
  }
});
