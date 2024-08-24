import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useStateContext } from "./ContextProvider";
import { useEffect } from "react";
import { off, onValue, ref } from "firebase/database";
import db from "../utils/firebaseconfig";
import Alert from '@mui/material/Alert';


export const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const { setDrivers } = useStateContext();
    const location = useLocation()
    useEffect(() => {
        if (!currentUser) {
            return <Navigate to="/login" replace />;
        }

        const driversRef = ref(db, '/drivers');
        const onDriversChange = (snapshot) => {
            const driversArray = snapshot.exists()
                ? Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }))
                : [];
            setDrivers(driversArray);
        };
        onValue(driversRef, onDriversChange, (error) => console.error('Error fetching drivers:', error));
        return () => { off(driversRef, 'value', onDriversChange); };
    }, []);

    if (currentUser.email.split(('-'))[0] === 'admin') {
        const adminRoutes = [
            'restaurants',
            'orders',
            'orders/pendingOrders',
            'add',
            'prices',
        ]
        if (!adminRoutes.includes(location.pathname.split('/')[1])) { return <Alert className="mx-4" variant="filled" severity="error">Access Denied</Alert> };
    }
    return children;
};
