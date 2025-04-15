import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchTaskById, addTaskComment, deleteTask, updateTaskStatus } from './tasksSlice';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    TextField,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Comment as CommentIcon,
    Person as PersonIcon,
    Assignment as ProjectIcon,
    AccessTime as AccessTimeIcon,
    AttachFile as AttachFileIcon,
    Update as UpdateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const TaskDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentTask, status, error } = useSelector(state => state.tasks);
    const { user } = useSelector(state => state.auth);
    const [commentText, setCommentText] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        dispatch(fetchTaskById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (currentTask) {
            setSelectedStatus(currentTask.status);
        }
    }, [currentTask]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            dispatch(addTaskComment({ id, text: commentText }));
            setCommentText('');
        }
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteTask(id)).then(() => {
            navigate('/tasks');
        });
        setDeleteDialogOpen(false);
    };

    const handleStatusUpdate = () => {
        setStatusDialogOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (selectedStatus !== currentTask.status) {
            dispatch(updateTaskStatus({ id, status: selectedStatus }))
                .unwrap()
                .then(() => {
                    setSnackbarMessage(`Task status updated to ${selectedStatus}`);
                    setSnackbarOpen(true);
                })
                .catch(error => {
                    setSnackbarMessage(`Error: ${error.message || 'Failed to update status'}`);
                    setSnackbarOpen(true);
                });
        }
        setStatusDialogOpen(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in-progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'on-hold':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'success';
            case 'medium':
                return 'info';
            case 'high':
                return 'warning';
            case 'urgent':
                return 'error';
            default:
                return 'default';
        }
    };

    // Check if current user is assigned to this task
    const isAssignedToTask = currentTask && 
        currentTask.assignedTo && 
        user && 
        (currentTask.assignedTo._id === user.id || 
         currentTask.assignedTo._id === user._id || 
         currentTask.assignedTo.id === user.id);

    const isAdmin = user && user.role === 'admin';

    // Only assigned users or admins can update status
    const canUpdateStatus = isAssignedToTask || isAdmin;

    if (status === 'loading' && !currentTask) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="error">{error}</Alert>
                <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
                    Back to Tasks
                </Button>
            </Box>
        );
    }

    if (!currentTask) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="info">Task not found</Alert>
                <Button component={Link} to="/tasks" sx={{ mt: 2 }}>
                    Back to Tasks
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {currentTask.title}
                    </Typography>
                    <Box>
                        <Button
                            component={Link}
                            to="/tasks"
                            variant="outlined"
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        {canUpdateStatus && (
                            <Button
                                variant="contained"
                                startIcon={<UpdateIcon />}
                                color="primary"
                                onClick={handleStatusUpdate}
                                sx={{ mr: 1 }}
                            >
                                Update Status
                            </Button>
                        )}
                        {isAdmin && (
                            <>
                                <Button
                                    component={Link}
                                    to={`/tasks/${id}/edit`}
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    color="error"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography paragraph>
                            {currentTask.description}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Task Details
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <ProjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Project:</strong> {currentTask.project?.name || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Assigned To:</strong> {currentTask.assignedTo?.name || 'Unassigned'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Due Date:</strong> {format(new Date(currentTask.dueDate), 'MMM dd, yyyy')}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="body1" sx={{ mr: 1 }}>
                                    <strong>Status:</strong>
                                </Typography>
                                <Chip
                                    label={currentTask.status}
                                    color={getStatusColor(currentTask.status)}
                                    size="small"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="body1" sx={{ mr: 1 }}>
                                    <strong>Priority:</strong>
                                </Typography>
                                <Chip
                                    label={currentTask.priority}
                                    color={getPriorityColor(currentTask.priority)}
                                    size="small"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Created By:</strong> {currentTask.createdBy?.name || 'Unknown'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body1">
                                    <strong>Created:</strong> {format(new Date(currentTask.createdAt), 'MMM dd, yyyy')}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {currentTask.attachments && currentTask.attachments.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Attachments
                        </Typography>
                        <List>
                            {currentTask.attachments.map((attachment, index) => (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <AttachFileIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={attachment.name}
                                        secondary={`Uploaded by ${attachment.uploadedBy?.name || 'Unknown'} on ${format(new Date(attachment.uploadedAt), 'MMM dd, yyyy')}`}
                                    />
                                    <Button variant="outlined" size="small" href={attachment.url} target="_blank">
                                        View
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {currentTask.comments && currentTask.comments.length > 0 ? (
                    <List>
                        {currentTask.comments.map((comment, index) => (
                            <ListItem key={index} alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar>
                                        <CommentIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={comment.postedBy?.name || 'Unknown'}
                                    secondary={
                                        <>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </Typography>
                                            {` — ${comment.text}`}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No comments yet
                    </Typography>
                )}

                <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        label="Add a comment"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SendIcon />}
                        sx={{ mt: 2 }}
                        disabled={!commentText.trim()}
                    >
                        Post Comment
                    </Button>
                </Box>
            </Paper>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please select the new status for this task.
                    </DialogContentText>
                    <FormControl fullWidth>
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            id="status-select"
                            value={selectedStatus}
                            label="Status"
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="on-hold">On Hold</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={confirmStatusUpdate} 
                        color="primary" 
                        variant="contained"
                        disabled={selectedStatus === currentTask.status}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};

export default TaskDetail; 