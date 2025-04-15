import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createProject } from './projectSlice';
import { fetchUsers } from '../users/userSlice';

const ProjectCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { loading, error } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: {
      name: '',
      email: '',
      phone: '',
    },
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'planning',
    budget: '',
    projectManager: '',
    team: [],
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('client.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        client: {
          ...formData.client,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.client.name.trim()) errors['client.name'] = 'Client name is required';
    if (!formData.client.email.trim()) errors['client.email'] = 'Client email is required';
    if (!formData.client.phone.trim()) errors['client.phone'] = 'Client phone is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate > formData.endDate) errors.endDate = 'End date must be after start date';
    if (!formData.budget) errors.budget = 'Budget is required';
    if (isNaN(formData.budget)) errors.budget = 'Budget must be a number';
    if (!formData.projectManager) errors.projectManager = 'Project manager is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await dispatch(createProject(formData));
      if (!result.error) {
        navigate('/projects');
      }
    }
  };

  if (usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Project
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Client Name"
                name="client.name"
                value={formData.client.name}
                onChange={handleChange}
                error={!!formErrors['client.name']}
                helperText={formErrors['client.name']}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Client Email"
                name="client.email"
                type="email"
                value={formData.client.email}
                onChange={handleChange}
                error={!!formErrors['client.email']}
                helperText={formErrors['client.email']}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Client Phone"
                name="client.phone"
                value={formData.client.phone}
                onChange={handleChange}
                error={!!formErrors['client.phone']}
                helperText={formErrors['client.phone']}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.startDate,
                      helperText: formErrors.startDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.endDate,
                      helperText: formErrors.endDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                error={!!formErrors.budget}
                helperText={formErrors.budget}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.projectManager}>
                <InputLabel>Project Manager</InputLabel>
                <Select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleChange}
                  label="Project Manager"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Team Members</InputLabel>
                <Select
                  multiple
                  name="team"
                  value={formData.team}
                  onChange={handleMultiSelectChange}
                  label="Team Members"
                  renderValue={(selected) => {
                    const selectedUsers = users.filter(user => selected.includes(user._id));
                    return selectedUsers.map(user => user.name).join(', ');
                  }}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectCreate; 