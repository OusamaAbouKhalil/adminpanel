import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { Button, TextField, Typography, Box, Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
    },
    background: {
      default: "#e8f5e9",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
});

const UpdateVersion = () => {
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const db = getDatabase();

  useEffect(() => {
    const versionRef = ref(db, "latest_version");
    const handleValueChange = (snapshot) => {
      if (snapshot.exists()) {
        setVersion(snapshot.val());
        setLoading(false);
      } else {
        setVersion("");
        setLoading(false);
      }
    };

    const unsubscribe = onValue(versionRef, handleValueChange);
    return () => unsubscribe(); // Clean up the subscription
  }, [db]);

  const handleVersionChange = (event) => {
    setVersion(event.target.value);
  };

  const handleUpdateVersion = async () => {
    try {
      const versionRef = ref(db, "latest_version");
      await set(versionRef, version); // Use set to directly set the value
      alert("Version updated successfully!");
    } catch (error) {
      console.error("Error updating version:", error);
      alert("Error updating version!");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box p={3} bgcolor="background.default" borderRadius={2} boxShadow={3}>
          <Typography variant="h4" gutterBottom>
            Update Latest Version
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              <TextField
                label="Latest Version"
                variant="outlined"
                fullWidth
                value={version}
                onChange={handleVersionChange}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateVersion}
                fullWidth
              >
                Update Version
              </Button>
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default UpdateVersion;
