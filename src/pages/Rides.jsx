import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  styled,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs from "dayjs";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0288d1",
    },
    secondary: {
      main: "#26a69a",
    },
    background: {
      default: "#f5f7fa",
    },
    grey: {
      200: "#e0e7ff",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#1a237e",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: "#fff",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  marginTop: theme.spacing(3),
}));

const TableCellStyled = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  padding: "16px",
}));

const statusColors = {
  waiting: "#ff9800",
  arrived: "#4caf50",
  accepted: "#2196f3",
  completed: "#673ab7",
  canceled: "#f44336",
  all: "#757575", // Added color for "all" status
};

const formatDate = (dateString) => {
  return dayjs(dateString).format("MMM D, YYYY h:mm A");
};

const RideTable = ({ rides, users, drivers, statusFilter }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUserDetails = (userId) => {
    const user = users[userId] || {};
    return {
      name: user.fullname || "Unknown",
      phone: user.phone || "N/A",
      profilePic: user.ProfilePic || "https://via.placeholder.com/50",
    };
  };

  const getDriverDetails = (driverId) => {
    const driver = drivers[driverId] || {};
    return {
      name: driver.fullname || "Unassigned",
      phone: driver.phone || "N/A",
      profilePic: driver.ProfilePic || "https://via.placeholder.com/50",
    };
  };

  const filteredRides = statusFilter === "all" 
    ? rides 
    : rides.filter(ride => ride.status.toLowerCase() === statusFilter);

  const sortedRides = filteredRides
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCellStyled>Order #</TableCellStyled>
            <TableCellStyled>Created</TableCellStyled>
            <TableCellStyled>Cost ($)</TableCellStyled>
            <TableCellStyled>Cost (L.L)</TableCellStyled>
            <TableCellStyled>Credits</TableCellStyled>
            <TableCellStyled>Payment</TableCellStyled>
            <TableCellStyled>Status</TableCellStyled>
            <TableCellStyled>Pickup</TableCellStyled>
            <TableCellStyled>Destination</TableCellStyled>
            <TableCellStyled>Rider</TableCellStyled>
            <TableCellStyled>Driver</TableCellStyled>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRides
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((ride) => {
              const riderDetails = getUserDetails(ride.client_id);
              const driverDetails = getDriverDetails(ride.driver_id);
              const statusColor = statusColors[ride.status.toLowerCase()] || "#757575";
              return (
                <TableRow key={ride.id} hover>
                  <TableCellStyled>{ride.order_hash}</TableCellStyled>
                  <TableCellStyled>{formatDate(ride.created_at)}</TableCellStyled>
                  <TableCellStyled>${ride.cost}</TableCellStyled>
                  <TableCellStyled>L.L{ride.cost_lira}</TableCellStyled>
                  <TableCellStyled>🪙{parseFloat(ride.costInCredits).toFixed(2)}</TableCellStyled>
                  <TableCellStyled>{ride.payment_method}</TableCellStyled>
                  <TableCellStyled>
                    <Chip 
                      label={ride.status} 
                      size="small"
                      sx={{ backgroundColor: statusColor, color: "#fff" }}
                    />
                  </TableCellStyled>
                  <TableCellStyled>{ride.pickup_address}</TableCellStyled>
                  <TableCellStyled>{ride.destination_address}</TableCellStyled>
                  <TableCellStyled>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={riderDetails.profilePic} sx={{ width: 32, height: 32 }} />
                      {riderDetails.name}
                    </Box>
                  </TableCellStyled>
                  <TableCellStyled>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={driverDetails.profilePic} sx={{ width: 32, height: 32 }} />
                      {driverDetails.name}
                    </Box>
                  </TableCellStyled>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRides.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </StyledTableContainer>
  );
};

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState({});
  const [drivers, setDrivers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingRides, setLoadingRides] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    waiting: 0,
    arrived: 0,
    accepted: 0,
    completed: 0,
    canceled: 0,
  });
  const [statusFilter, setStatusFilter] = useState("waiting");
  const db = getDatabase();

  useEffect(() => {
    const fetchRidesData = async () => {
      try {
        const rideRefs = [
          ref(db, "RideRequests"),
          ref(db, "RideRequestsHistory")
        ];
        
        const snapshots = await Promise.all(
          rideRefs.map(r => new Promise((resolve) => onValue(r, resolve)))
        );

        let allRides = [];
        snapshots.forEach(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const rideArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            allRides = [...allRides, ...rideArray];
          }
        });

        setRides(allRides);
        updateStatusCounts(allRides);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRides(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersRef = ref(db, "users");
        const snapshot = await new Promise((resolve) =>
          onValue(usersRef, resolve)
        );
        if (snapshot.exists()) {
          setUsers(snapshot.val());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchDrivers = async () => {
      try {
        const driversRef = ref(db, "drivers");
        const snapshot = await new Promise((resolve) =>
          onValue(driversRef, resolve)
        );
        if (snapshot.exists()) {
          setDrivers(snapshot.val());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchUsers();
    fetchDrivers();
    fetchRidesData();
  }, [db]);

  const updateStatusCounts = (rides) => {
    const counts = { waiting: 0, arrived: 0, accepted: 0, completed: 0, canceled: 0 };
    rides.forEach((ride) => {
      if (counts[ride.status.toLowerCase()] !== undefined) {
        counts[ride.status.toLowerCase()]++;
      }
    });
    setStatusCounts(counts);
  };

  if (loadingRides || loadingUsers || loadingDrivers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "90%", maxWidth: 1600, mx: "auto", p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Ride Management
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                }
              }}
            >
              <MenuItem value="all">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.all,
                      width: 20,
                      height: 20,
                    }}
                  />
                  All Statuses ({rides.length})
                </Box>
              </MenuItem>
              <MenuItem value="waiting">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.waiting,
                      width: 20,
                      height: 20,
                    }}
                  />
                  Waiting ({statusCounts.waiting})
                </Box>
              </MenuItem>
              <MenuItem value="arrived">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.arrived,
                      width: 20,
                      height: 20,
                    }}
                  />
                  Arrived ({statusCounts.arrived})
                </Box>
              </MenuItem>
              <MenuItem value="accepted">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.accepted,
                      width: 20,
                      height: 20,
                    }}
                  />
                  Accepted ({statusCounts.accepted})
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.completed,
                      width: 20,
                      height: 20,
                    }}
                  />
                  Completed ({statusCounts.completed})
                </Box>
              </MenuItem>
              <MenuItem value="canceled">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    size="small"
                    label=""
                    sx={{ 
                      backgroundColor: statusColors.canceled,
                      width: 20,
                      height: 20,
                    }}
                  />
                  Canceled ({statusCounts.canceled})
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <RideTable 
          rides={rides} 
          users={users} 
          drivers={drivers} 
          statusFilter={statusFilter}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Rides;
