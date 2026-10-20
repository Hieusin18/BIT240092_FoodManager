
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Dish } from "../models/Dish";
import type { DishCategory } from "../models/DishCategory";

import {
  getDishes,
  saveDishes,
  getCategories,
  saveCategories,
  addSyncOperation,
  getSyncQueue,
  saveSyncQueue,
} from "../services/storage";

import {
  fetchDishes,
  fetchCategories,
} from "../services/mockApi";

import { syncPendingOperations } from "../services/sync";
import DishCard from "../components/DishCard";
import DishForm from "../components/DishForm";
import {
  getSavedLocale,
  saveLocale,
  translate,
  translateCategoryName,
  type Locale,
  type TranslationKey,
} from "../locales/translations";

type DishTypeFilter = "all" | "Quick" | "Regular";

type AvailabilityFilter =
  | "all"
  | "available"
  | "unavailable";

type SortOrder =
  | "none"
  | "priceAsc"
  | "priceDesc"
  | "timeAsc";

export default function HomeScreen() {
  // Dữ liệu
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<DishCategory[]>([]);

  // Tìm kiếm
  const [search, setSearch] = useState("");

  // Bộ lọc
  const [dishTypeFilter, setDishTypeFilter] =
    useState<DishTypeFilter>("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sắp xếp
  const [sortOrder, setSortOrder] =
    useState<SortOrder>("none");

  // Trạng thái giao diện
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<TranslationKey | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | undefined>();
  const [locale, setLocale] = useState<Locale>("vi");
  const [languageReady, setLanguageReady] = useState(false);
  const t = (
    key: TranslationKey,
    values?: Record<string, string | number>,
  ) => translate(locale, key, values);

  useEffect(() => {
    let active = true;

    void getSavedLocale()
      .then((savedLocale) => {
        if (active && savedLocale) {
          setLocale(savedLocale);
        }
      })
      .catch((error) => {
        console.error("Lỗi tải tùy chọn ngôn ngữ:", error);
        if (active) {
          setMessage("languageLoadError");
        }
      })
      .finally(() => {
        if (active) {
          setLanguageReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Tải dữ liệu cục bộ trước, sau đó đồng bộ máy chủ
  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const localDishes = await getDishes();
      const localCategories = await getCategories();

      setDishes(localDishes);
      setCategories(localCategories);

      try {
        await syncPendingOperations();

        const [remoteDishes, remoteCategories] = await Promise.all([
          fetchDishes(),
          fetchCategories(),
        ]);

        await saveDishes(remoteDishes);
        await saveCategories(remoteCategories);

        setDishes(remoteDishes);
        setCategories(remoteCategories);
      } catch (error) {
        console.warn("Không tải được dữ liệu từ máy chủ:", error);
        setMessage("localDataWarning");
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu:", error);
      setMessage("localDataError");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Lấy tên danh mục
  const getCategoryName = (categoryId: string) => {
    const name = categories.find(
      (category) => category.BIT240092_Id === categoryId,
    )?.BIT240092_Name;

    return name
      ? translateCategoryName(locale, name)
      : t("unclassified");
  };

  async function handleLanguageToggle() {
    const nextLocale: Locale = locale === "vi" ? "en" : "vi";

    try {
      await saveLocale(nextLocale);
      setLocale(nextLocale);
    } catch (error) {
      console.error("Lỗi lưu tùy chọn ngôn ngữ:", error);
      Alert.alert(t("errorTitle"), t("languageSaveError"));
    }
  }

  // Tìm kiếm + lọc nhiều điều kiện + sắp xếp
  const filteredDishes = dishes
    .filter((dish) => {
      // Tìm theo một phần tên, không phân biệt chữ hoa/thường
      const dishName = String(dish.BIT240092_Name ?? "")
        .toLowerCase()
        .trim();

      const keyword = search.toLowerCase().trim();

      const matchesName = dishName.includes(keyword);

      // Quick: tối đa 15 phút; Regular: trên 15 phút
      const preparationTime = Number(
        dish.BIT240092_PreparationTime,
      );

      const dishType =
        preparationTime <= 15 ? "Quick" : "Regular";

      const matchesType =
        dishTypeFilter === "all" ||
        dishType === dishTypeFilter;

      // Lọc danh mục
      const matchesCategory =
        categoryFilter === "all" ||
        dish.BIT240092_DishCategoryId === categoryFilter;

      // Lọc trạng thái bán
      const isAvailable = dish.BIT240092_IsAvailable === true;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && isAvailable) ||
        (availabilityFilter === "unavailable" && !isAvailable);

      // Lọc khoảng giá
      const price = Number(dish.BIT240092_Price);

      const min =
        minPrice.trim() === "" ? null : Number(minPrice);

      const max =
        maxPrice.trim() === "" ? null : Number(maxPrice);

      const matchesMinPrice =
        min === null ||
        (Number.isFinite(min) && price >= min);

      const matchesMaxPrice =
        max === null ||
        (Number.isFinite(max) && price <= max);

      return (
        matchesName &&
        matchesType &&
        matchesCategory &&
        matchesAvailability &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.BIT240092_Price);
      const priceB = Number(b.BIT240092_Price);

      const timeA = Number(a.BIT240092_PreparationTime);
      const timeB = Number(b.BIT240092_PreparationTime);

      if (sortOrder === "priceAsc") {
        return priceA - priceB;
      }

      if (sortOrder === "priceDesc") {
        return priceB - priceA;
      }

      if (sortOrder === "timeAsc") {
        return timeA - timeB;
      }

      return 0;
    });

  // Xóa tất cả điều kiện tìm kiếm, lọc và sắp xếp
  function resetFilters() {
    setSearch("");
    setDishTypeFilter("all");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("none");
  }

  // Mở form thêm
  function openAddForm() {
    setEditingDish(undefined);
    setFormVisible(true);
  }

  // Mở form sửa
  function openEditForm(dish: Dish) {
    setEditingDish(dish);
    setFormVisible(true);
  }

  // Lưu món ăn
  async function handleSaveDish(dish: Dish) {
    try {
      const isEditing = dishes.some(
        (item) => item.BIT240092_Id === dish.BIT240092_Id,
      );

      const updatedDishes = isEditing
        ? dishes.map((item) =>
          item.BIT240092_Id === dish.BIT240092_Id
            ? dish
            : item,
        )
        : [dish, ...dishes];

      // Lưu trên thiết bị trước
      await saveDishes(updatedDishes);
      setDishes(updatedDishes);

      // Thêm thao tác vào hàng đợi đồng bộ
      await addSyncOperation({
        operationId: `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`,
        entity: "dish",
        action: isEditing ? "update" : "create",
        entityId: dish.BIT240092_Id,
        payload: dish,
      });

      setFormVisible(false);
      setEditingDish(undefined);

      // Thử đồng bộ; nếu thất bại, dữ liệu vẫn được lưu cục bộ
      try {
        await syncPendingOperations();
      } catch (error) {
        console.warn("Thao tác đang chờ đồng bộ:", error);
      }

      Alert.alert(
        t("savedTitle"),
        t("savedMessage"),
      );
    } catch (error) {
      console.error("Lỗi lưu món ăn:", error);

      Alert.alert(
        t("errorTitle"),
        t("saveDishError"),
      );
    }
  }

  // Xóa món ăn
  function handleDeleteDish(dish: Dish) {
    Alert.alert(
      t("confirmDeleteTitle"),
      t("confirmDeleteMessage", { name: dish.BIT240092_Name }),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                const currentDishes = await getDishes();

                const updatedDishes = currentDishes.filter(
                  (item) =>
                    item.BIT240092_Id !== dish.BIT240092_Id,
                );

                await saveDishes(updatedDishes);
                setDishes(updatedDishes);

                // Xử lý hàng đợi đồng bộ của món bị xóa
                const queue = await getSyncQueue();

                const dishOperations = queue.filter(
                  (operation) =>
                    operation.entity === "dish" &&
                    operation.entityId === dish.BIT240092_Id,
                );

                // Món mới tạo ngoại tuyến chưa cần gửi lệnh xóa
                const wasCreatedOffline = dishOperations.some(
                  (operation) => operation.action === "create",
                );

                const remainingQueue = queue.filter(
                  (operation) =>
                    !(
                      operation.entity === "dish" &&
                      operation.entityId === dish.BIT240092_Id
                    ),
                );

                if (!wasCreatedOffline) {
                  remainingQueue.push({
                    operationId: `delete_dish_${dish.BIT240092_Id}_${Date.now()}`,
                    entity: "dish",
                    action: "delete",
                    entityId: dish.BIT240092_Id,
                  });
                }

                await saveSyncQueue(remainingQueue);

                try {
                  await syncPendingOperations();
                } catch (error) {
                  console.warn("Xóa đang chờ đồng bộ:", error);
                }

                Alert.alert(
                  t("deletedTitle"),
                  t("deletedMessage"),
                );
              } catch (error) {
                console.error("Lỗi khi xóa món ăn:", error);

                Alert.alert(
                  t("errorTitle"),
                  t("deleteDishError"),
                );
              }
            })();
          },
        },
      ],
    );
  }

  // Giao diện các bộ lọc
  function renderFilters() {
    return (
      <View>
        <Text style={styles.title}>{t("appTitle")}</Text>

        {/* Tìm kiếm */}
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.search, styles.searchInput]}
            placeholder={t("searchPlaceholder")}
            value={search}
            onChangeText={setSearch}
          />
          <Pressable
            style={styles.languageButton}
            onPress={() => void handleLanguageToggle()}
            disabled={!languageReady}
            accessibilityRole="button"
            accessibilityLabel={t(
              locale === "vi" ? "switchToEnglish" : "switchToVietnamese",
            )}
          >
            <Text style={styles.languageButtonText}>
              {t(locale === "vi" ? "switchToEnglish" : "switchToVietnamese")}
            </Text>
          </Pressable>
        </View>

        {/* Lọc loại món */}
        <Text style={styles.filterTitle}>{t("dishType")}</Text>

        <View style={styles.filterRow}>
          {(["all", "Quick", "Regular"] as const).map((type) => (
            <Pressable
              key={type}
              style={[
                styles.filterButton,
                dishTypeFilter === type &&
                styles.filterButtonActive,
              ]}
              onPress={() => setDishTypeFilter(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  dishTypeFilter === type &&
                  styles.filterButtonTextActive,
                ]}
              >
                {type === "all"
                  ? t("all")
                  : type === "Quick"
                    ? t("quick")
                    : t("regular")}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Lọc danh mục */}
        <Text style={styles.filterTitle}>{t("categories")}</Text>

        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterButton,
              categoryFilter === "all" &&
              styles.filterButtonActive,
            ]}
            onPress={() => setCategoryFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                categoryFilter === "all" &&
                styles.filterButtonTextActive,
              ]}
            >
              {t("all")}
            </Text>
          </Pressable>

          {categories.map((category) => (
            <Pressable
              key={category.BIT240092_Id}
              style={[
                styles.filterButton,
                categoryFilter === category.BIT240092_Id &&
                styles.filterButtonActive,
              ]}
              onPress={() =>
                setCategoryFilter(category.BIT240092_Id)
              }
            >
              <Text
                style={[
                  styles.filterButtonText,
                  categoryFilter === category.BIT240092_Id &&
                  styles.filterButtonTextActive,
                ]}
              >
                {translateCategoryName(locale, category.BIT240092_Name)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Lọc trạng thái */}
        <Text style={styles.filterTitle}>{t("salesStatus")}</Text>

        <View style={styles.filterRow}>
          {(
            [
              ["all", t("all")],
              ["available", t("available")],
              ["unavailable", t("unavailable")],
            ] as const
          ).map(([value, label]) => (
            <Pressable
              key={value}
              style={[
                styles.filterButton,
                availabilityFilter === value &&
                styles.filterButtonActive,
              ]}
              onPress={() => setAvailabilityFilter(value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  availabilityFilter === value &&
                  styles.filterButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Lọc khoảng giá */}
        <Text style={styles.filterTitle}>{t("priceRange")}</Text>

        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            placeholder={t("minimumPrice")}
            value={minPrice}
            onChangeText={(value) =>
              setMinPrice(value.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
          />

          <Text style={styles.priceSeparator}>{t("to")}</Text>

          <TextInput
            style={styles.priceInput}
            placeholder={t("maximumPrice")}
            value={maxPrice}
            onChangeText={(value) =>
              setMaxPrice(value.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
          />
        </View>

        {/* Sắp xếp */}
        <Text style={styles.filterTitle}>{t("sort")}</Text>

        <View style={styles.filterRow}>
          {(
            [
              ["none", t("defaultSort")],
              ["priceAsc", t("priceAscending")],
              ["priceDesc", t("priceDescending")],
              ["timeAsc", t("timeAscending")],
            ] as const
          ).map(([value, label]) => (
            <Pressable
              key={value}
              style={[
                styles.filterButton,
                sortOrder === value &&
                styles.filterButtonActive,
              ]}
              onPress={() => setSortOrder(value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  sortOrder === value &&
                  styles.filterButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Xóa bộ lọc */}
        <View style={styles.toolbar}>
          <Text style={styles.count}>
            {t("foundDishes", {
              found: filteredDishes.length,
              total: dishes.length,
            })}
          </Text>

          <Pressable
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>
              {t("resetFilters")}
            </Text>
          </Pressable>
        </View>

        {/* Thêm món */}
        <Pressable
          style={styles.addButton}
          onPress={openAddForm}
        >
          <Text style={styles.addButtonText}>{t("addDish")}</Text>
        </Pressable>

        {message ? (
          <Text style={styles.message}>{t(message)}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            {t("loadingDishes")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.BIT240092_Id}
          renderItem={({ item }) => (
            <View style={styles.dishContainer}>
              <Pressable
                onPress={() => openEditForm(item)}
                accessibilityRole="button"
                accessibilityLabel={`${t("edit")} ${item.BIT240092_Name}`}
              >
                <DishCard
                  dish={item}
                  categoryName={getCategoryName(
                    item.BIT240092_DishCategoryId,
                  )}
                  locale={locale}
                />
              </Pressable>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => openEditForm(item)}
                >
                  <Text style={styles.actionText}>
                    {t("edit")}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDish(item)}
                >
                  <Text style={styles.actionText}>{t("delete")}</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListHeaderComponent={renderFilters}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t("noMatchingDishes")}
            </Text>
          }
          contentContainerStyle={styles.listContent}
          onRefresh={loadData}
          refreshing={loading}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Form thêm / sửa món ăn */}
      <Modal
        visible={formVisible}
        animationType="slide"
        onRequestClose={() => setFormVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <DishForm
            categories={categories}
            initialDish={editingDish}
            locale={locale}
            onSave={handleSaveDish}
            onCancel={() => {
              setFormVisible(false);
              setEditingDish(undefined);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    color: "#222222",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  languageButton: {
    minHeight: 48,
    minWidth: 84,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1976D2",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  languageButtonText: {
    color: "#1976D2",
    fontWeight: "600",
  },
  search: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 6,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: {
    backgroundColor: "#1976D2",
    borderColor: "#1976D2",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#333333",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priceInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceSeparator: {
    color: "#555555",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  count: {
    fontSize: 14,
    color: "#444444",
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  resetButtonText: {
    color: "#333333",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  message: {
    color: "#A65A00",
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555555",
  },
  dishContainer: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30,
    color: "#666666",
  },
  listContent: {
    paddingBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});
