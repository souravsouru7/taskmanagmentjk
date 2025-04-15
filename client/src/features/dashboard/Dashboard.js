import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { fetchUserTasks } from '../tasks/tasksSlice';
import { fetchUserProjects } from '../projects/projectSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { projects, loading: projectsLoading } = useSelector(
    (state) => state.projects
  );

  useEffect(() => {
    dispatch(fetchUserTasks());
    dispatch(fetchUserProjects());
  }, [dispatch]);

  // Redirect to the appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // The code below will not be executed due to the redirects above
  // Keeping it for reference or in case the redirects are removed
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter(
      (task) => task.status === 'in-progress'
    ).length;
    const pending = tasks.filter((task) => task.status === 'pending').length;

    return { total, completed, inProgress, pending };
  };

  const getProjectStats = () => {
    const total = projects.length;
    const completed = projects.filter(
      (project) => project.status === 'completed'
    ).length;
    const active = projects.filter(
      (project) => project.status === 'active'
    ).length;
    const pending = projects.filter(
      (project) => project.status === 'pending'
    ).length;

    return { total, completed, active, pending };
  };

  if (tasksLoading || projectsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Grid container spacing={3}>
        {/* Task Statistics */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Task Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{taskStats.total}</Typography>
                  <Typography variant="body2">Total Tasks</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'success.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{taskStats.completed}</Typography>
                  <Typography variant="body2">Completed</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'warning.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{taskStats.inProgress}</Typography>
                  <Typography variant="body2">In Progress</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'error.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{taskStats.pending}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Project Statistics */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Project Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{projectStats.total}</Typography>
                  <Typography variant="body2">Total Projects</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'success.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{projectStats.completed}</Typography>
                  <Typography variant="body2">Completed</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'warning.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{projectStats.active}</Typography>
                  <Typography variant="body2">Active</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'error.light',
                    color: 'white',
                  }}
                >
                  <Typography variant="h4">{projectStats.pending}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 