import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ThemeProvider,
  createTheme,
  TableSortLabel,
  IconButton
} from "@mui/material";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getDatabase, ref, update } from "firebase/database";
import SearchIcon from '@mui/icons-material/Search';

// Modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b", // Teal
    },
    secondary: {
      main: "#d32f2f", // Red
    },
    background: {
      default: "#f0f2f5" // Light grey background
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const UsersTable = ({ users }) => {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    fullname: "",
    phone: "",
    email: "",
    balance: "",
    status: "",
    ProfilePic: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [orderCounts, setOrderCounts] = useState({});
  const [specialOrderCounts, setSpecialOrderCounts] = useState({});
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortAttribute, setSortAttribute] = useState('fullname');

  // Fetch order counts for each user
  const fetchOrderCounts = async () => {
    const db = getFirestore();
    const newOrderCounts = {};
    const newSpecialOrderCounts = {};

    for (const user of users) {
      const ordersRef = collection(db, "orders");
      const specialOrdersRef = collection(db, "special_orders");

      // Fetch restaurant orders count
      const ordersQuery = query(ordersRef, where("user_id", "==", user.id));
      try {
        const ordersSnapshot = await getDocs(ordersQuery);
        newOrderCounts[user.id] = ordersSnapshot.size;
      } catch (error) {
        console.error("Error fetching restaurant order count for user", user.id, ":", error);
        newOrderCounts[user.id] = 0;
      }

      // Fetch special orders count
      const specialOrdersQuery = query(specialOrdersRef, where("userId", "==", user.id));
      try {
        const specialOrdersSnapshot = await getDocs(specialOrdersQuery);
        newSpecialOrderCounts[user.id] = specialOrdersSnapshot.size;
      } catch (error) {
        console.error("Error fetching special order count for user", user.id, ":", error);
        newSpecialOrderCounts[user.id] = 0;
      }
    }

    setOrderCounts(newOrderCounts);
    setSpecialOrderCounts(newSpecialOrderCounts);
  };

  useEffect(() => {
    fetchOrderCounts();
  }, [users]);

  // Attribute mapping for sorting
  const attributeMapping = {
    fullname: (user) => user.fullname.toLowerCase(),
    email: (user) => user.email.toLowerCase(),
    phone: (user) => user.phone.toLowerCase(),
    balance: (user) => parseFloat(user.balance),
    rides: (user) => user.RideHistory?.length || 0,
    orders: (user) => orderCounts[user.id] || 0,
    specialOrders: (user) => specialOrderCounts[user.id] || 0,
  };

  // Filtered users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting function
  const handleSort = (attribute) => {
    const direction = sortAttribute === attribute && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortAttribute(attribute);
    setSortDirection(direction);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = attributeMapping[sortAttribute](a);
    const bValue = attributeMapping[sortAttribute](b);

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Open the edit dialog
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setUpdatedUser({
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      balance: user.balance,
      status: user.status,
      ProfilePic: user.ProfilePic,
    });
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Save the updated data
  const handleSave = () => {
    if (currentUser) {
      const db = getDatabase();
      const userRef = ref(db, `users/${currentUser.id}`);

      // Update the user data in Firebase
      update(userRef, updatedUser)
        .then(() => {
          console.log('User data updated successfully');
          handleClose();
        })
        .catch((error) => {
          console.error('Error updating user data:', error);
        });
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <TableContainer
        component={Paper}
        style={{ padding: "20px", backgroundColor: theme.palette.background.default }}
      >
        <Typography variant="h5" align="center" gutterBottom style={{ marginBottom: "20px", color: theme.palette.primary.main }}>
          User List
        </Typography>
        <TextField
          margin="dense"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
          style={{ marginBottom: "20px" }}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'fullname'}
                  direction={sortDirection}
                  onClick={() => handleSort('fullname')}
                >
                  Full Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'email'}
                  direction={sortDirection}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'phone'}
                  direction={sortDirection}
                  onClick={() => handleSort('phone')}
                >
                  Phone
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'balance'}
                  direction={sortDirection}
                  onClick={() => handleSort('balance')}
                >
                  Balance
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'rides'}
                  direction={sortDirection}
                  onClick={() => handleSort('rides')}
                >
                  Number of Rides
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'orders'}
                  direction={sortDirection}
                  onClick={() => handleSort('orders')}
                >
                  Number of Restaurant Orders
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortAttribute === 'specialOrders'}
                  direction={sortDirection}
                  onClick={() => handleSort('specialOrders')}
                >
                  Number of Special Orders
                </TableSortLabel>
              </TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar alt={user.fullname} src={user.ProfilePic} style={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell>{user.fullname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.balance}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{user.RideHistory?.length || 0}</TableCell>
                <TableCell>{orderCounts[user.id] || 0}</TableCell>
                <TableCell>{specialOrderCounts[user.id] || 0}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            name="fullname"
            value={updatedUser.fullname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Phone"
            name="phone"
            value={updatedUser.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={updatedUser.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Balance"
            name="balance"
            value={updatedUser.balance}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Status"
            name="status"
            value={updatedUser.status}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Profile Picture URL"
            name="ProfilePic"
            value={updatedUser.ProfilePic}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default UsersTable;
