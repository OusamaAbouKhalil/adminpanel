import React, { useState, useEffect } from "react";
//import icons
import { FaEdit } from "react-icons/fa";
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
  Switch,
  TablePagination,
  Box,
} from "@mui/material";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getDatabase, ref, update } from "firebase/database";
import SearchIcon from "@mui/icons-material/Search";

// Modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
    },
    secondary: {
      main: "#d32f2f",
    },
    background: {
      default: "#e8f5e9",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      color: "#00796b",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    MuiTableCell: {
      root: {
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
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
    canOrder: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [orderCounts, setOrderCounts] = useState({});
  const [specialOrderCounts, setSpecialOrderCounts] = useState({});
  const [sortDirection, setSortDirection] = useState("desc"); // Default to descending
  const [sortAttribute, setSortAttribute] = useState("totalSum"); // Default to totalSum
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Compute total sum of rides, orders, and special orders
  const computeTotalSum = (user) => {
    const ridesCount = Array.isArray(user.RideHistory)
      ? user.RideHistory.length
      : Object.keys(user.RideHistory || {}).length;
    const ordersCount = orderCounts[user.id] || 0;
    const specialOrdersCount = specialOrderCounts[user.id] || 0;
    return ridesCount + ordersCount + specialOrdersCount;
  };

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
        console.error(
          "Error fetching restaurant order count for user",
          user.id,
          ":",
          error
        );
        newOrderCounts[user.id] = 0;
      }

      // Fetch special orders count
      const specialOrdersQuery = query(
        specialOrdersRef,
        where("userId", "==", user.id)
      );
      try {
        const specialOrdersSnapshot = await getDocs(specialOrdersQuery);
        newSpecialOrderCounts[user.id] = specialOrdersSnapshot.size;
      } catch (error) {
        console.error(
          "Error fetching special order count for user",
          user.id,
          ":",
          error
        );
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
    totalSum: (user) => computeTotalSum(user),
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
    const direction =
      sortAttribute === attribute && sortDirection === "desc" ? "asc" : "desc";
    setSortAttribute(attribute);
    setSortDirection(direction);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = attributeMapping[sortAttribute](a);
    const bValue = attributeMapping[sortAttribute](b);

    if (aValue < bValue) return sortDirection === "desc" ? 1 : -1;
    if (aValue > bValue) return sortDirection === "desc" ? -1 : 1;
    return 0;
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImageOpen = (user) => {
    // open the image is the center of screen without downloading it to the device 
    window.open(user.ProfilePic, "_blank");
    
  };

  // Open dialog
  const handleClickOpen = (user) => {
    setCurrentUser(user);
    setUpdatedUser({
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      balance: user.balance,
      status: user.status,
      ProfilePic: user.ProfilePic,
      canOrder: user.canOrder,
    });
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Update user data
  const handleUpdateUser = async () => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${currentUser.id}`);
      await update(userRef, updatedUser);
      alert("User updated successfully!");
      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user!");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box p={2}>
        <Typography variant="h5">Users</Typography>
        {/* make the search at the right  */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
            style={{ marginBottom: "16px" }}
          />
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Profile</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "fullname"}
                    direction={sortDirection}
                    onClick={() => handleSort("fullname")}
                  >
                    Full Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "email"}
                    direction={sortDirection}
                    onClick={() => handleSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "phone"}
                    direction={sortDirection}
                    onClick={() => handleSort("phone")}
                  >
                    Phone
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "balance"}
                    direction={sortDirection}
                    onClick={() => handleSort("balance")}
                  >
                    Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "rides"}
                    direction={sortDirection}
                    onClick={() => handleSort("rides")}
                  >
                    Rides
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "orders"}
                    direction={sortDirection}
                    onClick={() => handleSort("orders")}
                  >
                    Orders
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "specialOrders"}
                    direction={sortDirection}
                    onClick={() => handleSort("specialOrders")}
                  >
                    Special Orders
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortAttribute === "totalSum"}
                    direction={sortDirection}
                    onClick={() => handleSort("totalSum")}
                  >
                    Total Orders
                  </TableSortLabel>
                </TableCell>
                <TableCell>Can Order?</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar
                        onClick={() => handleImageOpen(user)}
                        src={user.ProfilePic}
                        alt={user.fullname}
                        style={{ width: 50, height: 50 }}
                      />
                    </TableCell>
                    <TableCell>{user.fullname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.status == "unverified"
                        ? "Not Verified"
                        : "Verified"}
                    </TableCell>
                    <TableCell>🪙{user.balance}</TableCell>
                    <TableCell>
                      🚕
                      {Array.isArray(user.RideHistory)
                        ? user.RideHistory.length
                        : Object.keys(user.RideHistory || {}).length}
                    </TableCell>
                    <TableCell>🍔{orderCounts[user.id] || 0}</TableCell>
                    <TableCell>📦{specialOrderCounts[user.id] || 0}</TableCell>
                    <TableCell>🟰{computeTotalSum(user)}</TableCell>
                    <TableCell>{user.canOrder ? "Yes😁" : "No👀"}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleClickOpen(user)}
                      >
                        <FaEdit />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={updatedUser.fullname}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, fullname: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Phone"
              type="text"
              fullWidth
              variant="outlined"
              value={updatedUser.phone}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, phone: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={updatedUser.email}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, email: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Balance"
              type="number"
              fullWidth
              variant="outlined"
              value={updatedUser.balance}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, balance: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Profile Picture URL"
              type="text"
              fullWidth
              variant="outlined"
              value={updatedUser.ProfilePic}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, ProfilePic: e.target.value })
              }
            />
            <Box display="flex" alignItems="center" mt={2}>
              <Typography>Can Order:</Typography>
              <Switch
                checked={updatedUser.canOrder}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, canOrder: e.target.checked })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default UsersTable;
