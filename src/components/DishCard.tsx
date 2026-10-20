
import { Image, StyleSheet, Text, View } from "react-native";
import type { Dish } from "../models/Dish";
import { translate, type Locale } from "../locales/translations";

type Props = {
    dish: Dish;
    categoryName: string;
    locale: Locale;
    onPress?: () => void;
};

export default function DishCard({
    dish,
    categoryName,
    locale,
    onPress,
}: Props) {
    const thumbnail = dish.BIT240092_DishImage.find(
        (image) => image.BIT240092_IsThumbnail,
    ) ?? dish.BIT240092_DishImage[0];

    // Phân loại món ăn theo thời gian chế biến
    const dishType =
        dish.BIT240092_PreparationTime <= 15 ? "Quick" : "Regular";

    return (
        <View style={styles.card}>
            {thumbnail?.BIT240092_ImageUrl ? (
                <Image
                    source={{ uri: thumbnail.BIT240092_ImageUrl }}
                    style={styles.image}
                />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Text>{translate(locale, "noImage")}</Text>
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name}>
                    {dish.BIT240092_Name}
                </Text>

                <Text style={styles.category}>
                    {categoryName}
                </Text>

                <Text style={styles.price}>
                    {dish.BIT240092_Price.toLocaleString("vi-VN")} đ
                </Text>

                <Text>
                    {translate(locale, "preparationTime")}{" "}
                    {dish.BIT240092_PreparationTime}{" "}
                    {translate(locale, "minutes")}
                </Text>


                {/* Hiển thị loại món ăn */}
                <Text style={styles.dishType}>
                    {translate(locale, "dishTypeCardPrefix")}{" "}
                    {translate(locale, dishType === "Quick" ? "quick" : "regular")}
                </Text>

                <Text
                    style={{
                        color: dish.BIT240092_IsAvailable ? "green" : "red",
                    }}
                >
                    {dish.BIT240092_IsAvailable
                        ? translate(locale, "serving")
                        : translate(locale, "notServing")}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginVertical: 6,
        padding: 10,
        elevation: 2,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    placeholder: {
        backgroundColor: "#EEEEEE",
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
        gap: 5,
    },
    name: {
        fontSize: 17,
        fontWeight: "bold",
    },
    category: {
        color: "#666666",
    },
    price: {
        fontSize: 16,
        color: "#D35400",
        fontWeight: "bold",
    },
    dishType: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1976D2",
    },
});
