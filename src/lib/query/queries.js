import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, getRestaurantById, getRestaurants, updateOrderStatus } from '../firebase/api';

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