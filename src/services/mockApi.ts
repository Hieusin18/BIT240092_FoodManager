
import type { Dish } from "../models/Dish";
import type { DishCategory } from "../models/DishCategory";

// Địa chỉ gốc của MockAPI
const BASE_URL =
    "https://6ad7398895e98f36aef20da8.mockapi.io/api/v1";

// API danh mục món ăn
const CATEGORY_ENDPOINT = `${BASE_URL}/BIT240092_DishCategory`;

// API món ăn
const DISH_ENDPOINT = `${BASE_URL}/BIT240092_Dish`;

// MockAPI tự tạo trường id riêng cho mỗi bản ghi.
// BIT240092_Id là mã do ứng dụng quản lý.
export type RemoteDish = Dish & {
    id: string;
};

export type RemoteCategory = DishCategory & {
    id: string;
};

// Hàm dùng chung để gửi HTTP request
async function request<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    // Nếu API trả về lỗi HTTP
    if (!response.ok) {
        const detail = await response.text();

        throw new Error(
            `MockAPI lỗi ${response.status}: ${detail || response.statusText}`,
        );
    }

    // Một số request DELETE trả về HTTP 204,
    // nghĩa là thành công nhưng không có nội dung.
    if (response.status === 204) {
        return undefined as T;
    }

    const responseText = await response.text();

    // Phòng trường hợp API trả về nội dung rỗng
    if (!responseText) {
        return undefined as T;
    }

    try {
        return JSON.parse(responseText) as T;
    } catch {
        throw new Error("MockAPI trả về dữ liệu không phải JSON hợp lệ.");
    }
}

// ==================================================
// 1. LẤY DANH SÁCH
// ==================================================

/** Lấy toàn bộ món ăn từ MockAPI */
export function fetchDishes(): Promise<RemoteDish[]> {
    return request<RemoteDish[]>(DISH_ENDPOINT);
}

/** Lấy toàn bộ danh mục món ăn từ MockAPI */
export function fetchCategories(): Promise<RemoteCategory[]> {
    return request<RemoteCategory[]>(CATEGORY_ENDPOINT);
}

// ==================================================
// 2. THÊM MỚI
// ==================================================

/** Thêm một món ăn */
export function createDish(dish: Dish): Promise<RemoteDish> {
    return request<RemoteDish>(DISH_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(dish),
    });
}

/** Thêm một danh mục */
export function createCategory(
    category: DishCategory,
): Promise<RemoteCategory> {
    return request<RemoteCategory>(CATEGORY_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(category),
    });
}

// ==================================================
// 3. CẬP NHẬT
// serverId là trường id do MockAPI tạo ra
// ==================================================

/** Cập nhật món ăn */
export function updateDish(
    serverId: string,
    dish: Dish,
): Promise<RemoteDish> {
    return request<RemoteDish>(
        `${DISH_ENDPOINT}/${encodeURIComponent(serverId)}`,
        {
            method: "PUT",
            body: JSON.stringify(dish),
        },
    );
}

/** Cập nhật danh mục */
export function updateCategory(
    serverId: string,
    category: DishCategory,
): Promise<RemoteCategory> {
    return request<RemoteCategory>(
        `${CATEGORY_ENDPOINT}/${encodeURIComponent(serverId)}`,
        {
            method: "PUT",
            body: JSON.stringify(category),
        },
    );
}

// ==================================================
// 4. XÓA
// ==================================================

/** Xóa món ăn theo id do MockAPI tạo */
export function deleteDish(serverId: string): Promise<void> {
    return request<void>(
        `${DISH_ENDPOINT}/${encodeURIComponent(serverId)}`,
        {
            method: "DELETE",
        },
    );
}

/** Xóa danh mục theo id do MockAPI tạo */
export function deleteCategory(serverId: string): Promise<void> {
    return request<void>(
        `${CATEGORY_ENDPOINT}/${encodeURIComponent(serverId)}`,
        {
            method: "DELETE",
        },
    );
}
