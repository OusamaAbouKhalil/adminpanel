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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  styled,
  TablePagination,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs from "dayjs";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
    },
    secondary: {
      main: "#004d40",
    },
    background: {
      default: "#e8f5e9",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
  },
  "& .Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  width: "100%",
  height: "calc(100vh - 160px)",
  overflowY: "auto",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const TableCellStyled = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const statusColors = {
  waiting: "#fbc02d", // Yellow
  arrived: "#4caf50", // Green
  accepted: "#2196f3", // Blue
  completed: "#9c27b0", // Purple
  canceled: "#e53935", // Red
};

const formatDate = (dateString) => {
  return dayjs(dateString).format("MMMM D, YYYY h:mm A");
};

const RideTable = ({ rides, users, drivers }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUserDetails = (userId) => {
    const user = users[userId] || {};
    return {
      name: user.fullname || "Unknown",
      phone: user.phone || "Unknown",
      profilePic: user.ProfilePic || "https://via.placeholder.com/50",
    };
  };

  const getDriverDetails = (driverId) => {
    const driver = drivers[driverId] || {};
    return {
      name: driver.fullname || "Unknown",
      phone: driver.phone || "Unknown",
      profilePic: driver.ProfilePic || "https://via.placeholder.com/50",
    };
  };

  // Sort rides by created_at date in descending order
  const sortedRides = rides
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <StyledTableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCellStyled style={{ width: "8%" }}>
              Order Hash
            </TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Created At
            </TableCellStyled>
            <TableCellStyled style={{ width: "8%" }}>Cost</TableCellStyled>
            <TableCellStyled style={{ width: "8%" }}>Cost Lira</TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Cost In Credits
            </TableCellStyled>
            <TableCellStyled style={{ width: "10%" }}>
              Payment Method
            </TableCellStyled>
            <TableCellStyled style={{ width: "10%" }}>
              Payment Status
            </TableCellStyled>
            <TableCellStyled style={{ width: "15%" }}>
              Pickup Address
            </TableCellStyled>
            <TableCellStyled style={{ width: "15%" }}>
              Destination Address
            </TableCellStyled>
            <TableCellStyled style={{ width: "8%" }}>Ride Type</TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Rider Name
            </TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Rider Phone
            </TableCellStyled>
            <TableCellStyled style={{ width: "10%" }}>
              Rider Profile Picture
            </TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Driver Name
            </TableCellStyled>
            <TableCellStyled style={{ width: "12%" }}>
              Driver Phone
            </TableCellStyled>
            <TableCellStyled style={{ width: "8%" }}>Status</TableCellStyled>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRides
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((ride) => {
              const riderDetails = getUserDetails(ride.client_id);
              const driverDetails = getDriverDetails(ride.driver_id);
              const statusColor =
                statusColors[ride.status.toLowerCase()] || "#ffffff"; // Default to white if status not found
              return (
                <TableRow key={ride.id}>
                  <TableCellStyled>{ride.order_hash}</TableCellStyled>
                  <TableCellStyled>
                    {formatDate(ride.created_at)}
                  </TableCellStyled>
                  <TableCellStyled>${ride.cost}</TableCellStyled>
                  <TableCellStyled>L.L{ride.cost_lira}</TableCellStyled>
                  <TableCellStyled>🪙
                    {parseFloat(ride.costInCredits).toFixed(2)}
                  </TableCellStyled>
                  <TableCellStyled>{ride.payment_method}</TableCellStyled>
                  <TableCellStyled>{ride.payment_status}</TableCellStyled>
                  <TableCellStyled>{ride.pickup_address}</TableCellStyled>
                  <TableCellStyled>{ride.destination_address}</TableCellStyled>
                  <TableCellStyled>{ride.ride_type}</TableCellStyled>
                  <TableCellStyled>{riderDetails.name}</TableCellStyled>
                  <TableCellStyled>{riderDetails.phone}</TableCellStyled>
                  <TableCellStyled>
                    <Avatar
                      src={riderDetails.profilePic}
                      alt={riderDetails.name}
                    />
                  </TableCellStyled>
                  <TableCellStyled>{driverDetails.name}</TableCellStyled>
                  <TableCellStyled>{driverDetails.phone}</TableCellStyled>
                  <TableCellStyled
                    style={{ backgroundColor: statusColor, color: "#ffffff" }}
                  >
                    {ride.status}
                  </TableCellStyled>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={rides.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{ padding: "0 16px" }} // Align pagination with table
      />
    </StyledTableContainer>
  );
};

const Rides = () => {
  const [tabValue, setTabValue] = useState(0);
  const [currentRides, setCurrentRides] = useState([]);
  const [historyRides, setHistoryRides] = useState([]);
  const [users, setUsers] = useState({});
  const [drivers, setDrivers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingRides, setLoadingRides] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    canceled: 0,
    completed: 0,
    accepted: 0,
    waiting: 0,
  });
  const db = getDatabase();

  useEffect(() => {
    const fetchRidesData = async (path, setRides) => {
      try {
        const ridesRef = ref(db, path);
        const snapshot = await new Promise((resolve) =>
          onValue(ridesRef, resolve)
        );
        if (snapshot.exists()) {
          const data = snapshot.val();
          const rideArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setRides(rideArray);
          updateStatusCounts(rideArray);
        } else {
          setRides([]);
        }
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
    fetchRidesData("RideRequests", setCurrentRides),
      fetchRidesData("RideRequestsHistory", setHistoryRides);
  }, [db]);

  const updateStatusCounts = (rides) => {
    const counts = { canceled: 0, completed: 0, accepted: 0, waiting: 0 };
    rides.forEach((ride) => {
      if (counts[ride.status.toLowerCase()] !== undefined) {
        counts[ride.status.toLowerCase()]++;
      }
    });
    setStatusCounts(counts);
  };

  if (loadingRides || loadingUsers || loadingDrivers) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "85%", p: 2 }}>
        <StyledTabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          aria-label="rides tabs"
        >
          <StyledTab
            label={`Current Rides (${statusCounts.waiting} waiting, ${statusCounts.accepted} accepted)`}
          />
          <StyledTab
            label={`Ride History (${statusCounts.completed} completed, ${statusCounts.canceled} canceled)`}
          />
        </StyledTabs>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Current Rides
            </Typography>
            <RideTable rides={currentRides} users={users} drivers={drivers} />
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Ride History
            </Typography>
            <RideTable rides={historyRides} users={users} drivers={drivers} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Rides;
