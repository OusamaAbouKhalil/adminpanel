import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  addAddonToRestaurant,
  createAdmin,
  createItem,
  createRestaurant,
  deleteAddon,
  deleteMenuItemAddon,
  getDashboardData,
  getMenuItem,
  getMenuItemAddons,
  getOrders,
  getPermissions,
  getPrices,
  getRestaurantAddons,
  getRestaurantById,
  getRestaurantMenu,
  getRestaurants,
  getUserOrderCounts,
  getUsers,
  saveItemAddons,
  setMenuItem,
  updateAddon,
  updateOrderPrices,
  updateOrderStatus,
  updatePrices,
} from "../firebase/api";

// In queries.js
export const useGetRestaurants = (searchTerm) => {
  return useInfiniteQuery({
    queryKey: ["restaurants", searchTerm],
    queryFn: ({ pageParam }) => getRestaurants(searchTerm, pageParam),
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};
export const useGetRestaurantsForOrders = (restaurantIds) => {
  return useQuery({
    queryKey: ["restaurants_for_orders", restaurantIds],
    queryFn: async () => {
      const uniqueIds = [...new Set(restaurantIds)];
      const restaurants = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          const data = await getRestaurantById(id);
          restaurants[id] = data;
        })
      );
      return restaurants;
    },
    enabled: restaurantIds?.length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
export const useGetRestaurantById = (id) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurantById(id),
  });
};
export const useGetOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });
};
export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: (updatedOrder) => updateOrderStatus(updatedOrder),
  });
};
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createRestaurant(data.formData, data.menuData),
    onSuccess: () => queryClient.invalidateQueries("restaurants"),
  });
};
export const useGetMenuItem = (data) => {
  return useQuery({
    queryKey: ["menu_item"],
    queryFn: () => getMenuItem(data.rest_id, data.item_id),
  });
};
export const useSetMenuItem = () => {
  return useMutation({
    mutationFn: (data) =>
      setMenuItem(data.rest_id, data.item_id, data.itemData),
  });
};
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const result = await createItem(data.rest_id, data.itemData);
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["restaurant_menu", variables.rest_id]);
    },
  });
};
export const useGetRestaurantMenu = (id) => {
  return useQuery({
    queryKey: ["restaurant_menu", id],
    queryFn: () => getRestaurantMenu(id),
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache kept for 30 minutes
    retry: 2, // Retry failed requests 2 times
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};
export const useGetPermissions = (currentUser, options = {}) => {
  return useQuery({
    queryKey: ["permissions", currentUser?.uid],
    queryFn: () => getPermissions(currentUser),
    enabled: !!currentUser && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, avatarFile }) => createAdmin(data, avatarFile),
    onSuccess: () => {
      queryClient.invalidateQueries("admins");
    },
  });
};

export const useGetDashboardData = (startDate, endDate) => {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getDashboardData(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

export const useGetUserOrderCounts = (userId) => {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: () => getUserOrderCounts(userId),
    enabled: !!userId,
  });
};

export const useGetUsersWithOrders = () => {
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers();
  const userIds = users.map((user) => user.id);

  const { data: orderCounts = {}, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["users-orders", userIds],
    queryFn: async () => {
      const counts = {};
      await Promise.all(
        userIds.map(async (userId) => {
          const data = await getUserOrderCounts(userId);
          counts[userId] = data;
        })
      );
      return counts;
    },
    enabled: userIds.length > 0,
  });

  const enrichedUsers = users.map((user) => {
    const orders = orderCounts[user.id] || { orders: 0, specialOrders: 0 };
    const ridesCount = Array.isArray(user.RideHistory)
      ? user.RideHistory.length
      : Object.keys(user.RideHistory || {}).length;

    return {
      ...user,
      ridesCount,
      ordersCount: orders.orders,
      specialOrdersCount: orders.specialOrders,
      totalCount: ridesCount + orders.orders + orders.specialOrders,
    };
  });

  return {
    users: enrichedUsers,
    isLoading: isLoadingUsers || isLoadingOrders,
  };
};
export const useGetAddons = ({ rest_id, item_id }) => {
  return useQuery({
    queryKey: ["addons", rest_id, item_id],
    queryFn: () => getMenuItemAddons(rest_id, item_id),
    enabled: !!rest_id && !!item_id,
  });
};
export const useDeleteMenuItemAddon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rest_id, item_id, addon_id }) =>
      deleteMenuItemAddon(rest_id, item_id, addon_id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "addons",
        variables.rest_id,
        variables.item_id,
      ]);
    },
  });
};
export const useGetPrices = () => {
  return useQuery({
    queryKey: ["prices"],
    queryFn: getPrices,
  });
};

export const useUpdatePrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrices,
    onSuccess: () => {
      queryClient.invalidateQueries(["prices"]);
    },
  });
};

export const useUpdateOrderPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["special_orders"] });
    },
  });
};
export const useAddAddonToRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, addonData }) =>
      addAddonToRestaurant(restaurantId, addonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant_addons"] });
    },
  });
};
export const useGetRestaurantAddons = (restaurantId) => {
  return useQuery({
    queryKey: ["restaurant_addons", restaurantId],
    queryFn: () => getRestaurantAddons(restaurantId),
    enabled: !!restaurantId,
  });
};

export const useSaveItemAddons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, itemId, selectedAddons }) =>
      saveItemAddons(restaurantId, itemId, selectedAddons),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["item_addons", variables.restaurantId, variables.itemId],
      });
      queryClient.invalidateQueries({
        queryKey: ["restaurant_menu", variables.restaurantId],
      });
    },
  });
};

export const useUpdateAddon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, addonId, addonData }) =>
      updateAddon(restaurantId, addonId, addonData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurant_addons", variables.restaurantId],
      });
    },
  });
};

export const useDeleteAddon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, addonId }) =>
      deleteAddon(restaurantId, addonId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["restaurant_addons", variables.restaurantId],
      });
    },
  });
};

export const updateSpecialOrderCost = async ({ orderId, cost }) => {
  const db = getDatabase();
  const orderRef = ref(db, `special_orders/${orderId}`);
  await update(orderRef, { cost });
};

export const useUpdateSpecialOrderCost = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSpecialOrderCost, {
    onSuccess: () => {
      queryClient.invalidateQueries("specialOrders");
    },
    onError: (error) => {
      console.error("Error updating special order cost:", error);
    },
  });
};
