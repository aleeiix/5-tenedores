import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "react-native-elements";
import BannerCarousel from "react-native-banner-carousel";

export default function Carousel(props) {
  const { images, width, height } = props;

  return (
    <BannerCarousel
      autoplay
      autoplayimeout={5000}
      loop
      index={0}
      pageSize={width}
      pageIndicatorStyle={styles.indicator}
      activePageIndicatorStyle={styles.indicatorActive}
    >
      {images.map(urlImage => (
        <View key={urlImage}>
          <Image style={{ width, height }} source={{ uri: urlImage }} />
        </View>
      ))}
    </BannerCarousel>
  );
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: "#00a680"
  },
  indicatorActive: {
    backgroundColor: "#00ffc5"
  }
});
