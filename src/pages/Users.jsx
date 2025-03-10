import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  CssBaseline,
  styled,
  LinearProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UsersTable from '../components/UsersTable';

// Custom theme for modern design
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Modern indigo
    },
    secondary: {
      main: '#f50057', // Vibrant pink
    },
    background: {
      default: '#f5f7fa', // Light gray-blue background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
});

// Styled components
const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)',
  borderRadius: theme.shape.borderRadius,
  color: '#ffffff',
  boxShadow: '0 4px 20px rgba(63, 81, 181, 0.3)',
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state for better UX

  useEffect(() => {
    const userRef = ref(getDatabase(), 'users');
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const userList = [];

      if (data) {
        for (let id in data) {
          userList.push({ id, ...data[id] });
        }
      }

      setUsers(userList);
      setLoading(false); // Set loading to false when data is fetched
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <HeaderBox>
          <Typography variant="h1" component="h2">
            User Management
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {users.length} Total Users
          </Typography>
        </HeaderBox>

        {/* Main Content */}
        <ContentPaper elevation={3}>
          {loading ? (
            <Box sx={{ width: '100%', py: 4 }}>
              <LinearProgress 
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(63, 81, 181, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(to right, #3f51b5, #7986cb)',
                  },
                }}
              />
            </Box>
          ) : (
            <UsersTable users={users} />
          )}
        </ContentPaper>
      </Container>
    </ThemeProvider>
  );
};

export default Users;
