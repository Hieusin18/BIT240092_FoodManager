
import NetInfo from "@react-native-community/netinfo";

import type { Dish } from "../models/Dish";
import type { DishCategory } from "../models/DishCategory";

import {
    createDish,
    createCategory,
    updateDish,
    updateCategory,
    deleteDish,
    deleteCategory,
    fetchDishes,
    fetchCategories,
} from "./mockApi";

import {
    getSyncQueue,
    saveSyncQueue,
    type SyncOperation,
} from "./storage";

// Tránh hai tiến trình đồng bộ chạy cùng lúc
let isSyncing = false;

// Kiểm tra thiết bị có kết nối Internet không
export async function isInternetAvailable(): Promise<boolean> {
    const state = await NetInfo.fetch();

    return (
        state.isConnected === true &&
        state.isInternetReachable !== false
    );
}

// Xóa một thao tác khỏi hàng đợi sau khi xử lý thành công
async function removeFromQueue(operationId: string): Promise<void> {
    const queue = await getSyncQueue();

    await saveSyncQueue(
        queue.filter(
            (operation) => operation.operationId !== operationId,
        ),
    );
}

// Đồng bộ một thao tác món ăn
async function syncDish(
    operation: SyncOperation,
): Promise<void> {
    const remoteDishes = await fetchDishes();

    // Tìm bằng mã của ứng dụng, không phải id của MockAPI
    const existing = remoteDishes.find(
        (dish) => dish.BIT240092_Id === operation.entityId,
    );

    if (operation.action === "delete") {
        // Nếu đã không còn trên máy chủ thì coi như đã xóa xong
        if (existing) {
            await deleteDish(existing.id);
        }
        return;
    }

    const dish = operation.payload as Dish | undefined;

    if (!dish) {
        throw new Error("Thao tác món ăn không có dữ liệu.");
    }

    if (existing) {
        // Đã có trên máy chủ: cập nhật, tránh tạo bản ghi trùng
        await updateDish(existing.id, dish);
    } else {
        // Chưa có trên máy chủ: tạo mới
        await createDish(dish);
    }
}

// Đồng bộ một thao tác danh mục
async function syncCategory(
    operation: SyncOperation,
): Promise<void> {
    const remoteCategories = await fetchCategories();

    const existing = remoteCategories.find(
        (category) =>
            category.BIT240092_Id === operation.entityId,
    );

    if (operation.action === "delete") {
        if (existing) {
            await deleteCategory(existing.id);
        }
        return;
    }

    const category = operation.payload as
        | DishCategory
        | undefined;

    if (!category) {
        throw new Error("Thao tác danh mục không có dữ liệu.");
    }

    if (existing) {
        await updateCategory(existing.id, category);
    } else {
        await createCategory(category);
    }
}

// Đồng bộ tất cả thao tác đang chờ
export async function syncPendingOperations(): Promise<void> {
    if (isSyncing) return;

    isSyncing = true;

    try {
        const online = await isInternetAvailable();

        if (!online) {
            console.log("Đang ngoại tuyến. Chưa thể đồng bộ.");
            return;
        }

        const queue = await getSyncQueue();

        for (const operation of queue) {
            try {
                if (operation.entity === "dish") {
                    await syncDish(operation);
                } else {
                    await syncCategory(operation);
                }

                // Chỉ xóa thao tác khi xử lý thành công
                await removeFromQueue(operation.operationId);

                console.log(
                    `Đồng bộ thành công: ${operation.operationId}`,
                );
            } catch (error) {
                // Giữ thao tác lỗi trong hàng đợi để thử lại sau
                console.error(
                    `Đồng bộ thất bại: ${operation.operationId}`,
                    error,
                );

                // Dừng tại lỗi đầu tiên để giữ đúng thứ tự thao tác
                break;
            }
        }
    } catch (error) {
        console.error("Không thể thực hiện đồng bộ:", error);
    } finally {
        isSyncing = false;
    }
}
