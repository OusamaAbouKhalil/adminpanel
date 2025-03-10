import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { FaEdit, FaTimes } from 'react-icons/fa';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  styled,
  InputLabel,
  FormControl,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Modern Theme (unchanged)
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: { root: { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' } },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, padding: '12px 24px' } },
    },
  },
});

// Styled Components (unchanged)
const StyledTabs = styled(Tabs)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  '& .MuiTab-root': {
    borderRadius: theme.shape.borderRadius,
    minHeight: 48,
    padding: '12px 24px',
    '&.Mui-selected': { background: theme.palette.primary.main, color: '#fff' },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  '& .MuiTableCell-head': {
    background: theme.palette.primary.main,
    color: '#fff',
    fontWeight: 600,
  },
}));

// Report Template
const generateReportTemplate = (revenues, startDate, endDate) => {
  const filteredRevenues = revenues.filter(rev => {
    const revDate = new Date(rev.date);
    return (!startDate || revDate >= new Date(startDate)) && 
           (!endDate || revDate <= new Date(endDate));
  });

  const totalAmount = filteredRevenues.reduce((sum, rev) => sum + rev.amount, 0);
  const byType = filteredRevenues.reduce((acc, rev) => {
    acc[rev.type] = (acc[rev.type] || 0) + rev.amount;
    return acc;
  }, {});

  return {
    title: 'Revenue Report',
    period: `${startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`,
    summary: {
      totalRevenue: totalAmount.toFixed(2),
      revenueByType: byType,
      totalTransactions: filteredRevenues.length,
    },
    details: filteredRevenues.map(rev => ({
      date: new Date(rev.date).toLocaleString(),
      amount: rev.amount.toFixed(2),
      type: rev.type,
      description: rev.description,
    })),
    generatedAt: new Date().toLocaleString(),
  };
};

const RevenuePage = () => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deliveryCharge');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [revenueList, setRevenueList] = useState([]);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('deliveryCharge');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [selectedRevenueId, setSelectedRevenueId] = useState(null);
  // Report states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    const fetchRevenues = async () => {
      const db = getFirestore();
      const revenueCollection = collection(db, 'revenue');
      const revenueQuery = query(revenueCollection, orderBy('date', 'desc'));
      const revenueSnapshot = await getDocs(revenueQuery);
      const revenueData = revenueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRevenueList(revenueData);
    };

    fetchRevenues();
  }, [saving]); // Added saving to refresh after updates

  const handleAddRevenue = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('success');

    if (!amount || !date || !description) {
      setMessage('Amount, Date, and Description are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'revenue'), {
        amount: parseFloat(amount),
        type,
        date: new Date(date).toISOString(),
        description,
      });

      setMessage('Revenue added successfully!');
      setAmount('');
      setDate('');
      setDescription('');
      setType('deliveryCharge');
    } catch (err) {
      console.error('Error adding revenue:', err);
      setMessage('Failed to add revenue.');
      setMessageType('error');
    }

    setSaving(false);
  };

  const handleEditChange = (revenue) => {
    setEditAmount(revenue.amount);
    setEditType(revenue.type);
    setEditDate(new Date(revenue.date).toISOString().slice(0, 16));
    setEditDescription(revenue.description);
    setSelectedRevenueId(revenue.id);
  };

  const handleUpdateRevenue = async (e) => {
    e.preventDefault();
    if (!editAmount || !editDate || !editDescription || !selectedRevenueId) {
      setMessage('Amount, Date, Description, and Revenue ID are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();
      const revenueRef = doc(db, 'revenue', selectedRevenueId);
      await updateDoc(revenueRef, {
        amount: parseFloat(editAmount),
        type: editType,
        date: new Date(editDate).toISOString(),
        description: editDescription,
      });

      setMessage('Revenue updated successfully!');
      setEditAmount('');
      setEditDate('');
      setEditDescription('');
      setEditType('deliveryCharge');
      setSelectedRevenueId(null);
    } catch (err) {
      setMessage('Failed to update revenue.');
      setMessageType('error');
      console.error('Error updating revenue:', err);
    }

    setSaving(false);
  };

  const handleGenerateReport = () => {
    const report = generateReportTemplate(revenueList, reportStartDate, reportEndDate);
    setGeneratedReport(report);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const reportText = `
Revenue Report
Generated: ${generatedReport.generatedAt}
Period: ${generatedReport.period}

Summary:
- Total Revenue: $${generatedReport.summary.totalRevenue}
- Transactions: ${generatedReport.summary.totalTransactions}
- Revenue by Type:
${Object.entries(generatedReport.summary.revenueByType)
  .map(([type, amount]) => `  ${type}: $${amount.toFixed(2)}`)
  .join('\n')}

Detailed Transactions:
${generatedReport.details
  .map((rev, index) => `${index + 1}. ${rev.date} | $${rev.amount} | ${rev.type} | ${rev.description}`)
  .join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Report_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center">
            Revenue Management
          </Typography>

          {/* Tabs */}
          <StyledTabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{ mb: 4 }}
          >
            <Tab label="Add Revenue" value="add" />
            <Tab label="Edit Revenue" value="edit" />
            <Tab label="Reports" value="reports" />
          </StyledTabs>

          {/* Message */}
          {message && (
            <Alert 
              severity={messageType === 'success' ? 'success' : 'error'}
              sx={{ mb: 4, borderRadius: theme.shape.borderRadius }}
            >
              {message}
            </Alert>
          )}

          {/* Add Revenue Form */}
          {activeTab === 'add' && (
            <Box component="form" onSubmit={handleAddRevenue} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Date & Time"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <TextField
                label="Amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="deliveryCharge">Delivery Charge</MenuItem>
                  <MenuItem value="profit">Profit</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving && <CircularProgress size={20} />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saving ? 'Adding...' : 'Add Revenue'}
              </Button>
            </Box>
          )}

          {/* Edit Revenue Section */}
          {activeTab === 'edit' && (
            <>
              <Typography variant="h6" gutterBottom>
                Current Revenues
              </Typography>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Amount</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell align="center">Description</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueList.map(revenue => (
                      <TableRow key={revenue.id} hover>
                        <TableCell>{new Date(revenue.date).toLocaleString()}</TableCell>
                        <TableCell align="center">${revenue.amount.toFixed(2)}</TableCell>
                        <TableCell align="center">{revenue.type}</TableCell>
                        <TableCell align="center">{revenue.description}</TableCell>
                        <TableCell align="center">
                          <Button
                            onClick={() => handleEditChange(revenue)}
                            color="primary"
                            size="small"
                            startIcon={<FaEdit />}
                          />
                          {selectedRevenueId === revenue.id && (
                            <Button
                              onClick={() => setSelectedRevenueId(null)}
                              color="secondary"
                              size="small"
                              startIcon={<FaTimes />}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>

              {selectedRevenueId && (
                <Box component="form" onSubmit={handleUpdateRevenue} sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="deliveryCharge">Delivery Charge</MenuItem>
                      <MenuItem value="profit">Profit</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    multiline
                    rows={4}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    startIcon={saving && <CircularProgress size={20} />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {saving ? 'Updating...' : 'Update Revenue'}
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Reports Section */}
          {activeTab === 'reports' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Revenue Report
              </Typography>
              <TextField
                label="Start Date"
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setReportDialogOpen(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Generate Report
              </Button>
            </Box>
          )}

          {/* Report Dialog */}
          <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Revenue Report Preview</DialogTitle>
            <DialogContent>
              {generatedReport ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6">{generatedReport.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated: {generatedReport.generatedAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Period: {generatedReport.period}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Summary</Typography>
                    <Typography>Total Revenue: ${generatedReport.summary.totalRevenue}</Typography>
                    <Typography>Transactions: {generatedReport.summary.totalTransactions}</Typography>
                    <Typography>Revenue by Type:</Typography>
                    {Object.entries(generatedReport.summary.revenueByType).map(([type, amount]) => (
                      <Typography key={type} sx={{ ml: 2 }}>
                        {type}: ${amount.toFixed(2)}
                      </Typography>
                    ))}
                  </Box>
                  <StyledTableContainer sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generatedReport.details.map((rev, index) => (
                          <TableRow key={index}>
                            <TableCell>{rev.date}</TableCell>
                            <TableCell>${rev.amount}</TableCell>
                            <TableCell>{rev.type}</TableCell>
                            <TableCell>{rev.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </Box>
              ) : (
                <Typography>No report generated yet. Click "Preview" to generate.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleGenerateReport} variant="outlined">
                Preview
              </Button>
              <Button 
                onClick={handleDownloadReport} 
                variant="contained" 
                color="primary"
                disabled={!generatedReport}
              >
                Download
              </Button>
              <Button onClick={() => setReportDialogOpen(false)} color="secondary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </StyledPaper>
      </Container>
    </ThemeProvider>
  );
};

export default RevenuePage;
