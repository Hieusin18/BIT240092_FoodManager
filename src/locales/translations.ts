import AsyncStorage from "@react-native-async-storage/async-storage";

export type Locale = "vi" | "en";

const vi = {
  appTitle: "Quản lý món ăn",
  switchToEnglish: "English",
  switchToVietnamese: "Tiếng Việt",
  searchPlaceholder: "Tìm kiếm theo tên món...",
  dishType: "Loại món ăn",
  all: "Tất cả",
  quick: "Nhanh",
  regular: "Thông thường",
  categories: "Danh mục món ăn",
  salesStatus: "Trạng thái bán",
  available: "Đang bán",
  unavailable: "Ngừng bán",
  priceRange: "Khoảng giá (VNĐ)",
  minimumPrice: "Giá thấp nhất",
  maximumPrice: "Giá cao nhất",
  to: "đến",
  sort: "Sắp xếp",
  defaultSort: "Mặc định",
  priceAscending: "Giá tăng",
  priceDescending: "Giá giảm",
  timeAscending: "Thời gian tăng",
  foundDishes: "Số món tìm thấy: {{found}}/{{total}}",
  resetFilters: "Xóa bộ lọc",
  addDish: "+ Thêm món ăn",
  loadingDishes: "Đang tải dữ liệu món ăn...",
  edit: "Chỉnh sửa",
  delete: "Xóa",
  noMatchingDishes: "Chưa có món ăn phù hợp với điều kiện tìm kiếm.",
  unclassified: "Chưa phân loại",
  savedTitle: "Đã lưu",
  savedMessage:
    "Món ăn đã được lưu trên thiết bị. Nếu chưa có mạng, dữ liệu sẽ chờ đồng bộ.",
  errorTitle: "Lỗi",
  saveDishError:
    "Không thể lưu món ăn. Hãy kiểm tra Console trong VS Code.",
  confirmDeleteTitle: "Xác nhận xóa",
  confirmDeleteMessage: 'Bạn có chắc muốn xóa món "{{name}}" không?',
  cancel: "Hủy",
  deletedTitle: "Đã xóa",
  deletedMessage: "Món ăn đã được xóa khỏi danh sách trên thiết bị.",
  deleteDishError:
    "Không thể xóa món ăn. Hãy kiểm tra Console trong VS Code.",
  localDataWarning:
    "Không có kết nối máy chủ. Đang dùng dữ liệu trên thiết bị.",
  localDataError: "Không thể đọc dữ liệu cục bộ.",
  languageLoadError: "Không thể tải tùy chọn ngôn ngữ đã lưu.",
  languageSaveError: "Không thể lưu tùy chọn ngôn ngữ.",
  dishEditingTitle: "Chỉnh sửa món ăn",
  dishAddingTitle: "Thêm món ăn",
  dishNameLabel: "Tên món ăn *",
  nameExample: "Ví dụ: Phở bò",
  priceLabel: "Giá tiền (VNĐ) *",
  priceExample: "Ví dụ: 45000",
  preparationTimeLabel: "Thời gian chế biến (phút) *",
  timeExample: "Ví dụ: 20",
  dishTypePrefix: "Loại món ăn:",
  categoryLabel: "Danh mục *",
  noCategories:
    "Chưa có danh mục. Hãy tạo danh mục trên MockAPI trước.",
  descriptionLabel: "Mô tả",
  descriptionPlaceholder: "Mô tả món ăn...",
  dishImages: "Hình ảnh món ăn",
  imageInstructions:
    "Nhập URL ảnh. Chọn một ảnh làm ảnh đại diện cho món ăn.",
  imageNumber: "Ảnh {{number}}",
  thumbnailSuffix: " (Ảnh đại diện)",
  thumbnailSelected: "Ảnh đại diện đã chọn",
  selectThumbnail: "Chọn làm ảnh đại diện",
  removeImage: "Xóa ảnh",
  addAnotherImage: "+ Thêm ảnh khác",
  selling: "Đang bán",
  saveDish: "Lưu món ăn",
  saving: "Đang lưu...",
  requiredFieldsNote: "* Các trường có dấu sao là bắt buộc.",
  invalidDataTitle: "Dữ liệu chưa hợp lệ",
  enterDishName: "Vui lòng nhập tên món ăn.",
  priceMustBePositive: "Giá món ăn phải lớn hơn 0.",
  timeMustBePositive: "Thời gian chế biến phải lớn hơn 0.",
  selectValidCategory: "Vui lòng chọn danh mục hợp lệ.",
  invalidImageUrl:
    "Mỗi URL ảnh phải bắt đầu bằng http:// hoặc https://.",
  unableToSaveDish: "Không thể lưu món ăn",
  unknownError: "Đã xảy ra lỗi không xác định.",
  noImage: "Chưa có ảnh",
  preparationTime: "Thời gian chế biến:",
  minutes: "phút",
  dishTypeCardPrefix: "Loại món:",
  serving: "Đang phục vụ",
  notServing: "Ngừng phục vụ",
} as const;

const en: Record<keyof typeof vi, string> = {
  appTitle: "Dish Manager",
  switchToEnglish: "English",
  switchToVietnamese: "Tiếng Việt",
  searchPlaceholder: "Search by dish name...",
  dishType: "Dish type",
  all: "All",
  quick: "Quick",
  regular: "Regular",
  categories: "Dish categories",
  salesStatus: "Availability",
  available: "Available",
  unavailable: "Unavailable",
  priceRange: "Price range (VND)",
  minimumPrice: "Minimum price",
  maximumPrice: "Maximum price",
  to: "to",
  sort: "Sort by",
  defaultSort: "Default",
  priceAscending: "Price: low to high",
  priceDescending: "Price: high to low",
  timeAscending: "Preparation time: low to high",
  foundDishes: "Dishes found: {{found}}/{{total}}",
  resetFilters: "Clear filters",
  addDish: "+ Add dish",
  loadingDishes: "Loading dishes...",
  edit: "Edit",
  delete: "Delete",
  noMatchingDishes: "No dishes match your search criteria.",
  unclassified: "Uncategorized",
  savedTitle: "Saved",
  savedMessage:
    "The dish was saved on this device. It will sync when a connection is available.",
  errorTitle: "Error",
  saveDishError: "Could not save the dish. Check the VS Code console.",
  confirmDeleteTitle: "Confirm deletion",
  confirmDeleteMessage: 'Are you sure you want to delete "{{name}}"?',
  cancel: "Cancel",
  deletedTitle: "Deleted",
  deletedMessage: "The dish was removed from this device.",
  deleteDishError: "Could not delete the dish. Check the VS Code console.",
  localDataWarning:
    "Server unavailable. Showing data stored on this device.",
  localDataError: "Could not read local data.",
  languageLoadError: "Could not load the saved language preference.",
  languageSaveError: "Could not save the language preference.",
  dishEditingTitle: "Edit dish",
  dishAddingTitle: "Add dish",
  dishNameLabel: "Dish name *",
  nameExample: "Example: Beef pho",
  priceLabel: "Price (VND) *",
  priceExample: "Example: 45000",
  preparationTimeLabel: "Preparation time (minutes) *",
  timeExample: "Example: 20",
  dishTypePrefix: "Dish type:",
  categoryLabel: "Category *",
  noCategories: "No categories yet. Create a category in MockAPI first.",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Describe the dish...",
  dishImages: "Dish images",
  imageInstructions:
    "Enter image URLs. Choose one image as the dish thumbnail.",
  imageNumber: "Image {{number}}",
  thumbnailSuffix: " (Thumbnail)",
  thumbnailSelected: "Thumbnail selected",
  selectThumbnail: "Set as thumbnail",
  removeImage: "Remove image",
  addAnotherImage: "+ Add another image",
  selling: "Available for sale",
  saveDish: "Save dish",
  saving: "Saving...",
  requiredFieldsNote: "* Fields marked with an asterisk are required.",
  invalidDataTitle: "Invalid data",
  enterDishName: "Enter a dish name.",
  priceMustBePositive: "The price must be greater than 0.",
  timeMustBePositive: "Preparation time must be greater than 0.",
  selectValidCategory: "Select a valid category.",
  invalidImageUrl: "Each image URL must start with http:// or https://.",
  unableToSaveDish: "Could not save the dish",
  unknownError: "An unknown error occurred.",
  noImage: "No image",
  preparationTime: "Preparation time:",
  minutes: "min",
  dishTypeCardPrefix: "Type:",
  serving: "Available",
  notServing: "Unavailable",
};

export type TranslationKey = keyof typeof vi;

const translations: Record<Locale, Record<TranslationKey, string>> = {
  vi,
  en,
};

const LANGUAGE_KEY = "BIT240092_Language";

const categoryTranslations: Record<string, string> = {
  "món chính": "Main course",
  "đồ ăn nhanh": "Fast food",
  "đồ uống": "Drinks",
  "món khai vị": "Appetizers",
  "khai vị": "Appetizers",
  "món tráng miệng": "Desserts",
  "tráng miệng": "Desserts",
  "đồ ăn vặt": "Snacks",
  "món ăn vặt": "Snacks",
};

export function translateCategoryName(locale: Locale, name: string): string {
  if (locale === "vi") {
    return name;
  }

  return categoryTranslations[name.trim().toLocaleLowerCase("vi-VN")] ?? name;
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  return translations[locale][key].replace(
    /\{\{(\w+)\}\}/g,
    (placeholder, name: string) => String(values[name] ?? placeholder),
  );
}

export async function getSavedLocale(): Promise<Locale | null> {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (value === null) {
    return null;
  }

  if (value === "vi" || value === "en") {
    return value;
  }

  throw new Error("Saved language preference is invalid.");
}

export async function saveLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, locale);
}
