
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Dish } from "../models/Dish";
import type { DishCategory } from "../models/DishCategory";

// Các khóa lưu trữ đều có tiền tố MSSV.
const DISH_KEY = "BIT240092_Dish";
const CATEGORY_KEY = "BIT240092_DishCategory";
const QUEUE_KEY = "BIT240092_SyncQueue";

// Các thao tác chờ đồng bộ lên MockAPI.
export type SyncOperation = {
    operationId: string;
    entity: "dish" | "category";
    action: "create" | "update" | "delete";
    entityId: string;
    payload?: Dish | DishCategory;
};

// Đọc dữ liệu JSON an toàn.
async function readList<T>(key: string): Promise<T[]> {
    const value = await AsyncStorage.getItem(key);

    if (value === null) {
        return [];
    }

    try {
        const data: unknown = JSON.parse(value);

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu không phải danh sách.");
        }

        return data as T[];
    } catch {
        throw new Error(`Dữ liệu tại khóa ${key} không hợp lệ.`);
    }
}

// ================================
// MÓN ĂN
// ================================

export async function getDishes(): Promise<Dish[]> {
    return readList<Dish>(DISH_KEY);
}

export async function saveDishes(
    dishes: Dish[]
): Promise<void> {
    await AsyncStorage.setItem(
        DISH_KEY,
        JSON.stringify(dishes)
    );
}

// ================================
// LOẠI MÓN ĂN
// ================================

export async function getCategories(): Promise<DishCategory[]> {
    return readList<DishCategory>(CATEGORY_KEY);
}

export async function saveCategories(
    categories: DishCategory[]
): Promise<void> {
    await AsyncStorage.setItem(
        CATEGORY_KEY,
        JSON.stringify(categories)
    );
}

// ================================
// HÀNG ĐỢI ĐỒNG BỘ
// ================================

export async function getSyncQueue(): Promise<SyncOperation[]> {
    return readList<SyncOperation>(QUEUE_KEY);
}

export async function saveSyncQueue(
    queue: SyncOperation[]
): Promise<void> {
    await AsyncStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue)
    );
}

export async function addSyncOperation(
    operation: SyncOperation
): Promise<void> {
    const queue = await getSyncQueue();

    // Không thêm cùng một thao tác hai lần.
    const alreadyExists = queue.some(
        (item) => item.operationId === operation.operationId
    );

    if (alreadyExists) {
        return;
    }

    queue.push(operation);
    await saveSyncQueue(queue);
}
