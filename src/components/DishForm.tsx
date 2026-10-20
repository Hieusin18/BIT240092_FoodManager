import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import type { Dish } from "../models/Dish";
import type { DishCategory } from "../models/DishCategory";
import {
    translate,
    translateCategoryName,
    type Locale,
    type TranslationKey,
} from "../locales/translations";

type DishImage = {
    BIT240092_ImageUrl: string;
    BIT240092_IsThumbnail: boolean;
};

type Props = {
    categories: DishCategory[];
    initialDish?: Dish;
    locale: Locale;
    onSave: (dish: Dish) => void | Promise<void>;
    onCancel: () => void;
};

export default function DishForm({
    categories,
    initialDish,
    locale,
    onSave,
    onCancel,
}: Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [preparationTime, setPreparationTime] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const t = (
        key: TranslationKey,
        values?: Record<string, string | number>,
    ) => translate(locale, key, values);

    useEffect(() => {
        setName(initialDish?.BIT240092_Name ?? "");
        setPrice(
            initialDish ? String(initialDish.BIT240092_Price) : ""
        );
        setPreparationTime(
            initialDish
                ? String(initialDish.BIT240092_PreparationTime)
                : ""
        );
        setDescription(initialDish?.BIT240092_Description ?? "");
        setCategoryId(
            initialDish?.BIT240092_DishCategoryId ??
            categories[0]?.BIT240092_Id ??
            ""
        );
        setIsAvailable(initialDish?.BIT240092_IsAvailable ?? true);

        // Hỗ trợ cả dữ liệu ảnh cũ dạng URL string và dữ liệu mới dạng mảng.
        const rawImages: unknown = initialDish?.BIT240092_DishImage;
        let urls: string[] = [];
        let selectedIndex = 0;

        if (typeof rawImages === "string") {
            urls = rawImages.trim() ? [rawImages] : [];
        } else if (Array.isArray(rawImages)) {
            const validImages = rawImages.filter(
                (image): image is DishImage =>
                    image !== null &&
                    typeof image === "object" &&
                    typeof image.BIT240092_ImageUrl === "string"
            );

            urls = validImages.map((image) => image.BIT240092_ImageUrl);
            const index = validImages.findIndex(
                (image) => image.BIT240092_IsThumbnail === true
            );
            selectedIndex = index >= 0 ? index : 0;
        }

        setImageUrls(urls.length > 0 ? urls : [""]);
        setThumbnailIndex(selectedIndex);
    }, [initialDish, categories]);

    async function handleSave() {
        const trimmedName = name.trim();
        const numericPrice = Number(price);
        const numericTime = Number(preparationTime);

        if (!trimmedName) {
            Alert.alert(t("invalidDataTitle"), t("enterDishName"));
            return;
        }

        if (
            !price.trim() ||
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {
            Alert.alert(t("invalidDataTitle"), t("priceMustBePositive"));
            return;
        }

        if (
            !preparationTime.trim() ||
            !Number.isFinite(numericTime) ||
            numericTime <= 0
        ) {
            Alert.alert(
                t("invalidDataTitle"),
                t("timeMustBePositive")
            );
            return;
        }

        if (
            !categoryId ||
            !categories.some(
                (category) => category.BIT240092_Id === categoryId
            )
        ) {
            Alert.alert(t("invalidDataTitle"), t("selectValidCategory"));
            return;
        }

        const cleanedUrls = imageUrls
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        const invalidUrl = cleanedUrls.find(
            (url) => !/^https?:\/\/\S+$/i.test(url)
        );

        if (invalidUrl) {
            Alert.alert(
                t("invalidDataTitle"),
                t("invalidImageUrl")
            );
            return;
        }

        const images: DishImage[] = cleanedUrls.map((url, index) => ({
            BIT240092_ImageUrl: url,
            BIT240092_IsThumbnail:
                cleanedUrls.length > 0 && index === thumbnailIndex,
        }));

        // Đảm bảo có đúng một ảnh đại diện khi có ảnh.
        if (images.length > 0 && !images.some((image) => image.BIT240092_IsThumbnail)) {
            images[0].BIT240092_IsThumbnail = true;
        }

        const dish: Dish = {
            BIT240092_Id:
                initialDish?.BIT240092_Id ?? `DISH_${Date.now()}`,
            BIT240092_Name: trimmedName,
            BIT240092_Price: numericPrice,
            BIT240092_PreparationTime: numericTime,
            BIT240092_IsAvailable: isAvailable,
            BIT240092_Description: description.trim(),
            BIT240092_DishCategoryId: categoryId,
            BIT240092_DishImage: images,
        };

        try {
            setSaving(true);
            await onSave(dish);
        } catch (error) {
            Alert.alert(
                t("unableToSaveDish"),
                error instanceof Error
                    ? error.message
                    : t("unknownError")
            );
        } finally {
            setSaving(false);
        }
    }

    function updateImageUrl(index: number, value: string) {
        setImageUrls((current) =>
            current.map((url, currentIndex) =>
                currentIndex === index ? value : url
            )
        );
    }

    function removeImage(index: number) {
        setImageUrls((current) => {
            const next = current.filter((_, currentIndex) => currentIndex !== index);
            return next.length > 0 ? next : [""];
        });

        setThumbnailIndex((current) => {
            if (index < current) return current - 1;
            if (index === current) return 0;
            return current;
        });
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                {initialDish ? t("dishEditingTitle") : t("dishAddingTitle")}
            </Text>

            <Text style={styles.label}>{t("dishNameLabel")}</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t("nameExample")}
                maxLength={100}
            />

            <Text style={styles.label}>{t("priceLabel")}</Text>
            <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder={t("priceExample")}
                keyboardType="numeric"
            />

            <Text style={styles.label}>{t("preparationTimeLabel")}</Text>
            <TextInput
                style={styles.input}
                value={preparationTime}
                onChangeText={setPreparationTime}
                placeholder={t("timeExample")}
                keyboardType="numeric"
            />

            {preparationTime.trim() !== "" &&
                Number.isFinite(Number(preparationTime)) &&
                Number(preparationTime) > 0 ? (
                <Text style={styles.helpText}>
                    {t("dishTypePrefix")}{" "}
                    {Number(preparationTime) <= 15
                        ? t("quick")
                        : t("regular")}
                </Text>
            ) : null}

            <Text style={styles.label}>{t("categoryLabel")}</Text>
            {categories.length === 0 ? (
                <Text style={styles.warning}>
                    {t("noCategories")}
                </Text>
            ) : (
                <View style={styles.categoryList}>
                    {categories.map((category) => {
                        const selected = categoryId === category.BIT240092_Id;

                        return (
                            <PressableCategory
                                key={category.BIT240092_Id}
                                label={translateCategoryName(
                                    locale,
                                    category.BIT240092_Name,
                                )}
                                selected={selected}
                                onPress={() => setCategoryId(category.BIT240092_Id)}
                            />
                        );
                    })}
                </View>
            )}

            <Text style={styles.label}>{t("descriptionLabel")}</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder={t("descriptionPlaceholder")}
                multiline
                textAlignVertical="top"
            />

            <Text style={styles.label}>{t("dishImages")}</Text>
            <Text style={styles.helpText}>
                {t("imageInstructions")}
            </Text>

            {imageUrls.map((url, index) => (
                <View key={`image-${index}`} style={styles.imageItem}>
                    <Text style={styles.imageLabel}>
                        {t("imageNumber", { number: index + 1 })}
                        {url.trim() && index === thumbnailIndex
                            ? t("thumbnailSuffix")
                            : ""}
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={url}
                        onChangeText={(value) => updateImageUrl(index, value)}
                        placeholder="https://example.com/image.jpg"
                        autoCapitalize="none"
                        keyboardType="url"
                    />

                    {url.trim() && /^https?:\/\/\S+$/i.test(url.trim()) ? (
                        <Image
                            source={{ uri: url.trim() }}
                            style={styles.preview}
                            resizeMode="cover"
                        />
                    ) : null}

                    <View style={styles.imageActions}>
                        <View style={styles.imageActionButton}>
                            <Button
                                title={
                                    index === thumbnailIndex
                                        ? t("thumbnailSelected")
                                        : t("selectThumbnail")
                                }
                                disabled={index === thumbnailIndex || !url.trim()}
                                onPress={() => setThumbnailIndex(index)}
                            />
                        </View>

                        <View style={styles.imageActionButton}>
                            <Button
                                title={t("removeImage")}
                                color="#D32F2F"
                                onPress={() => removeImage(index)}
                            />
                        </View>
                    </View>
                </View>
            ))}

            <View style={styles.addImageButton}>
                <Button
                    title={t("addAnotherImage")}
                    onPress={() => {
                        setImageUrls((current) => [...current, ""]);
                        // Nếu đây là ảnh đầu tiên, nó sẽ được chọn làm ảnh đại diện.
                        if (imageUrls.length === 0) setThumbnailIndex(0);
                    }}
                />
            </View>

            <View style={styles.switchRow}>
                <Text style={styles.label}>{t("selling")}</Text>
                <Switch value={isAvailable} onValueChange={setIsAvailable} />
            </View>

            <View style={styles.buttons}>
                <View style={styles.button}>
                    <Button
                        title={t("cancel")}
                        color="#777777"
                        onPress={onCancel}
                        disabled={saving}
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title={saving ? t("saving") : t("saveDish")}
                        onPress={handleSave}
                        disabled={saving || categories.length === 0}
                    />
                </View>
            </View>

            <Text style={styles.note}>{t("requiredFieldsNote")}</Text>
        </ScrollView>
    );
}

type CategoryButtonProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

function PressableCategory({
    label,
    selected,
    onPress,
}: CategoryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.categoryItem,
                selected && styles.categorySelected,
            ]}
        >
            <Text
                style={[
                    styles.categoryText,
                    selected && styles.categoryTextSelected,
                ]}
            >
                {selected ? "✓ " : ""}
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 16,
        marginBottom: 16,
    },
    multiline: {
        minHeight: 90,
    },
    categoryList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    categoryItem: {
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    categorySelected: {
        borderColor: "#1976D2",
        backgroundColor: "#E3F2FD",
    },
    categoryText: {
        color: "#333333",
    },
    categoryTextSelected: {
        color: "#1565C0",
        fontWeight: "bold",
    },
    warning: {
        color: "#B45309",
        marginBottom: 16,
    },
    helpText: {
        color: "#666666",
        marginBottom: 12,
    },
    imageItem: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    imageLabel: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    preview: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#EEEEEE",
    },
    imageActions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    imageActionButton: {
        flexGrow: 1,
        flexBasis: 140,
    },
    addImageButton: {
        marginBottom: 20,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
    },
    note: {
        color: "#666666",
        marginTop: 12,
    },
});
