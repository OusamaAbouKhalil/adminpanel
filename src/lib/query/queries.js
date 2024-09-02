import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { addAddonToMenuItem, createAdmin, createItem, createRestaurant, getMenuItem, getOrders, getPermissions, getRestaurantById, getRestaurantMenu, getRestaurants, setMenuItem, updateOrderStatus } from '../firebase/api';

// In queries.js
export const useGetRestaurants = (searchTerm) => {
    return useInfiniteQuery({
        queryKey: ['restaurants', searchTerm],
        queryFn: ({ pageParam = null }) => getRestaurants(pageParam, searchTerm),
        getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
    });
}

export const useGetRestaurantById = (id) => {
    return useQuery({
        queryKey: ['restaurant', id],
        queryFn: () => getRestaurantById(id),
    });
}
export const useGetOrders = () => {
    return useQuery({
        queryKey: ['orders'],
        queryFn: () => getOrders(),
    });
}
export const useUpdateOrderStatus = () => {
    return useMutation({
        mutationFn: (updatedOrder) => updateOrderStatus(updatedOrder),
    });
}
export const useCreateRestaurant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => createRestaurant(data.formData, data.menuData),
        onSuccess: () => queryClient.invalidateQueries('restaurants'),
    });
}
export const useGetMenuItem = (data) => {
    return useQuery({
        queryKey: ['menu_item'],
        queryFn: () => getMenuItem(data.rest_id, data.item_id),
    });
}
export const useSetMenuItem = () => {
    return useMutation({
        mutationFn: (data) => setMenuItem(data.rest_id, data.item_id, data.itemData),
    });
}
export const useAddAddonToMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addAddonToMenuItem(data.rest_id, data.item_id, data.addonData),
        onSuccess: () => queryClient.invalidateQueries('menu_item'),
    });
}
export const useCreateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => createItem(data.rest_id, data.itemData),
        onSuccess: () => queryClient.invalidateQueries('menu_item'),
    });
}
export const useGetRestaurantMenu = (id) => {
    return useQuery({
        queryKey: ['restaurant_menu', id],
        queryFn: () => getRestaurantMenu(id),
    });
}
export const useGetPermissions = (currentUser) => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: () => getPermissions(currentUser),
    });
}
export const useCreateAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data, avatarFile }) => createAdmin(data, avatarFile),
        onSuccess: () => {
            queryClient.invalidateQueries('admins');
        },
    });
};