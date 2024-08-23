import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addAddonToMenuItem, createRestaurant, getMenuItem, getOrders, getRestaurantById, getRestaurants, setMenuItem, updateOrderStatus } from '../firebase/api';

export const useGetRestaurants = () => {
    return useQuery({
        queryKey: ['restaurants'],
        queryFn: () => getRestaurants(),
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