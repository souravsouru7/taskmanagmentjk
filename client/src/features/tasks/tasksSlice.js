import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../app/api';

// Get all tasks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/tasks');
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch tasks';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get user tasks
export const fetchUserTasks = createAsyncThunk(
    'tasks/fetchUserTasks',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            if (!auth.user) {
                return rejectWithValue({ message: 'User not authenticated' });
            }
            
            // Get the user ID in the format the server expects
            const userId = auth.user.id || auth.user._id;
            
            console.log('Fetching tasks for user:', userId);
            
            // Using the dedicated backend endpoint for user tasks
            try {
                const response = await API.get('/tasks/assigned-to-me');
                console.log('Found user tasks:', response.data.length);
                return response.data;
            } catch (apiError) {
                console.error('API error when fetching assigned tasks:', apiError);
                
                // If the dedicated endpoint fails, fall back to client-side filtering
                // This is a backup approach in case the endpoint has issues
                console.log('Falling back to client-side filtering of tasks');
                const allTasksResponse = await API.get('/tasks');
                const userTasks = allTasksResponse.data.filter(task => 
                    task.assignedTo && (task.assignedTo._id === userId || task.assignedTo.id === userId)
                );
                
                console.log('Found user tasks via fallback:', userTasks.length);
                return userTasks;
            }
        } catch (err) {
            let errorMessage = 'Failed to fetch user tasks';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            console.error('Error in fetchUserTasks:', err);
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Get task by ID
export const fetchTaskById = createAsyncThunk(
    'tasks/fetchTaskById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/tasks/${id}`);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to fetch task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Create new task (admin only)
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (taskData, { rejectWithValue, getState }) => {
        try {
            // Get the current user from the auth state
            const { auth } = getState();
            
            if (!auth.user) {
                console.error('No user in auth state');
                return rejectWithValue({ message: 'User not authenticated. Please log in again.' });
            }
            
            // Extract user ID from auth state - could be id or _id
            const userId = auth.user.id || auth.user._id;
            
            if (!userId) {
                console.error('Could not determine user ID from auth state:', auth.user);
                return rejectWithValue({ message: 'User ID not found. Please log in again.' });
            }
            
            // Explicitly add the createdBy field with the user ID
            const enhancedTaskData = { 
                ...taskData,
                createdBy: userId 
            };
            
            console.log('Creating task with data including createdBy:', enhancedTaskData);
            
            const response = await API.post('/tasks', enhancedTaskData);
            return response.data;
        } catch (err) {
            // Handle various error formats
            let errorMessage = 'Failed to create task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            console.error('Error creating task:', err, errorMessage);
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Update task (admin only)
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, ...taskData }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/tasks/${id}`, taskData);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to update task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Delete task (admin only)
export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.delete(`/tasks/${id}`);
            return { id, message: response.data.message };
        } catch (err) {
            let errorMessage = 'Failed to delete task';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Add comment to task
export const addTaskComment = createAsyncThunk(
    'tasks/addTaskComment',
    async ({ id, text }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/tasks/${id}/comments`, { text });
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to add comment';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            return rejectWithValue({ message: errorMessage });
        }
    }
);

// Update task status (available to assigned users and admins)
export const updateTaskStatus = createAsyncThunk(
    'tasks/updateTaskStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            console.log(`Updating task status: Task ID=${id}, New Status=${status}`);
            const response = await API.patch(`/tasks/${id}/status`, { status });
            console.log('Task status update response:', response.data);
            return response.data;
        } catch (err) {
            let errorMessage = 'Failed to update task status';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            console.error('Error updating task status:', err);
            return rejectWithValue({ message: errorMessage });
        }
    }
);

const initialState = {
    tasks: [],
    currentTask: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        setTaskStatus: (state, action) => {
            const { id, status } = action.payload;
            const task = state.tasks.find(task => task._id === id);
            if (task) {
                task.status = status;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all tasks
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = action.payload;
                state.error = null;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to fetch tasks';
            })
            
            // Fetch user tasks
            .addCase(fetchUserTasks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = action.payload;
                state.error = null;
            })
            .addCase(fetchUserTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to fetch user tasks';
            })
            
            // Fetch task by ID
            .addCase(fetchTaskById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentTask = action.payload;
                state.error = null;
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to fetch task';
            })
            
            // Create task
            .addCase(createTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks.push(action.payload);
                state.error = null;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to create task';
            })
            
            // Update task
            .addCase(updateTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                state.currentTask = action.payload;
                state.error = null;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to update task';
            })
            
            // Delete task
            .addCase(deleteTask.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tasks = state.tasks.filter(task => task._id !== action.payload.id);
                state.error = null;
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to delete task';
            })
            
            // Add comment
            .addCase(addTaskComment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentTask = action.payload;
                const index = state.tasks.findIndex(task => task._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(addTaskComment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to add comment';
            })
            
            // Update task status
            .addCase(updateTaskStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.tasks.findIndex(task => task._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                state.currentTask = action.payload;
                state.error = null;
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Failed to update task status';
            })
    }
});

export const { clearCurrentTask, setTaskStatus } = tasksSlice.actions;

export default tasksSlice.reducer; 