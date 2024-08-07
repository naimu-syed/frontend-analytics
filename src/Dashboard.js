import React, { useContext, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { WebSocketContext } from './WebSocketContext';
import {
  AppBar, Toolbar, Typography, Container, Paper, Box, TextField, Button,
  Table, TableBody, TableCell, TableHead, TableRow, Snackbar, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// GraphQL Queries and Mutations
const ALL_RECORDS_QUERY = gql`
  query GetAllRecords($nameFilter: String, $sortBy: String, $sortDirection: String) {
    allRecords(nameFilter: $nameFilter, sortBy: $sortBy, sortDirection: $sortDirection) {
      id
      name
      salary
    }
  }
`;

const CREATE_RECORD_MUTATION = gql`
  mutation CreateRecord($name: String!, $salary: Int!) {
    createRecord(name: $name, salary: $salary) {
      id
      name
      salary
    }
  }
`;

const UPDATE_RECORD_MUTATION = gql`
  mutation UpdateRecord($id: Int!, $name: String, $salary: Int) {
    updateRecord(id: $id, name: $name, salary: $salary) {
      id
      name
      salary
    }
  }
`;

const DELETE_RECORD_MUTATION = gql`
  mutation DeleteRecord($id: Int!) {
    deleteRecord(id: $id)
  }
`;

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '1200px',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  marginTop: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5, 3),
  fontSize: '16px',
}));

const DataExport = () => {
  const handleExport = async () => {
    const response = await fetch('http://localhost:8080/api/export/csv');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <StyledButton variant="contained" color="primary" onClick={handleExport}>Export Data</StyledButton>;
};

const Dashboard = () => {
  const { records } = useContext(WebSocketContext);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [editId, setEditId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { data, loading, error, refetch } = useQuery(ALL_RECORDS_QUERY, {
    variables: { nameFilter: filter, sortBy, sortDirection },
  });

  const [createRecord] = useMutation(CREATE_RECORD_MUTATION, {
    onCompleted: () => {
      setSnackbarMessage('Record Created');
      setOpenSnackbar(true);
      refetch();
    },
  });

  const [updateRecord] = useMutation(UPDATE_RECORD_MUTATION, {
    onCompleted: () => {
      setSnackbarMessage('Record Updated');
      setOpenSnackbar(true);
      refetch();
    },
  });

  const [deleteRecord] = useMutation(DELETE_RECORD_MUTATION, {
    onCompleted: () => {
      setSnackbarMessage('Record Deleted');
      setOpenSnackbar(true);
      refetch();
    },
  });

  const handleCreateOrUpdate = () => {
    if (editId) {
      updateRecord({ variables: { id: editId, name, salary: parseInt(salary) } });
    } else {
      createRecord({ variables: { name, salary: parseInt(salary) } });
    }
    setName('');
    setSalary('');
    setEditId(null);
  };

  const handleEdit = (record) => {
    setName(record.name);
    setSalary(record.salary);
    setEditId(record.id);
  };

  const handleDelete = (id) => {
    deleteRecord({ variables: { id } });
  };

  const handleCancelUpdate = () => {
    setName('');
    setSalary('');
    setEditId(null);
  };

  return (
    <StyledContainer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">GraphQL Analytics Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <StyledPaper>
        <Box display="flex" flexDirection="column" mb={3}>
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <StyledTextField
              label="Filter by Name"
              variant="outlined"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <StyledTextField
              label="Sort By"
              variant="outlined"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
            <StyledTextField
              label="Sort Direction"
              variant="outlined"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
            />
          </Box>
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <StyledTextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <StyledTextField
              label="Salary"
              variant="outlined"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
            <Box display="flex" gap={2} mt={2}>
              <StyledButton variant="contained" color="primary" onClick={handleCreateOrUpdate}>
                {editId ? 'Update Record' : 'Create Record'}
              </StyledButton>
              {editId && (
                <StyledButton variant="outlined" color="secondary" onClick={handleCancelUpdate}>
                  Cancel
                </StyledButton>
              )}
              <DataExport />
            </Box>
          </Box>
        </Box>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error :(</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.allRecords.map((record) => (
                <TableRow key={record.id} className="table-row">
                  <TableCell>{record.id}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.salary}</TableCell>
                  <TableCell>
                    <StyledButton onClick={() => handleEdit(record)} variant="outlined">
                      Edit
                    </StyledButton>
                    <StyledButton color="secondary" onClick={() => handleDelete(record.id)} variant="outlined">
                      Delete
                    </StyledButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </StyledPaper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setOpenSnackbar(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </StyledContainer>
  );
};

export default Dashboard;
