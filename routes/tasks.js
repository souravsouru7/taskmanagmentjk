const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');

// Create a new task (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        console.log('Creating task with body:', req.body);
        console.log('Current user from middleware:', req.user);
        
        const { title, description, project, assignedTo, priority, dueDate, status, createdBy } = req.body;

        // Validate project exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Validate assigned user exists if provided
        if (assignedTo) {
            const userExists = await User.findById(assignedTo);
            if (!userExists) {
                return res.status(404).json({ message: 'Assigned user not found' });
            }
        }

        // Determine the creator ID - priority to token user if no createdBy provided
        let taskCreator;
        
        if (createdBy) {
            // If createdBy is provided in request, validate it refers to a real user
            const creatorExists = await User.findById(createdBy);
            if (creatorExists) {
                taskCreator = createdBy;
                console.log('Using provided creator ID:', taskCreator);
            } else {
                console.log('Provided createdBy is invalid, falling back to authenticated user');
                taskCreator = req.user._id;
            }
        } else {
            // Default to the authenticated user
            taskCreator = req.user._id;
            console.log('No createdBy provided, using authenticated user:', taskCreator);
        }
        
        // Ensure we have a creator ID before attempting to create the task
        if (!taskCreator) {
            console.error('Failed to determine task creator');
            return res.status(400).json({ message: 'Could not determine task creator' });
        }

        const task = new Task({
            title,
            description,
            project,
            assignedTo,
            priority,
            dueDate,
            createdBy: taskCreator,
            status: status || 'pending'
        });

        console.log('Task object before saving:', task);
        
        const savedTask = await task.save();
        console.log('Task created successfully:', savedTask._id);
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        
        // Better error message for validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            // Extract specific validation error messages
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors,
                details: error.message
            });
        }
        
        res.status(500).json({ message: error.message });
    }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tasks assigned to the current user - IMPORTANT: This route must be defined BEFORE /:id route
router.get('/assigned-to-me', auth, async (req, res) => {
    try {
        console.log('Getting tasks for user ID:', req.user._id);
        
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name');
        
        console.log(`Found ${tasks.length} tasks assigned to user ${req.user._id}`);
        res.json(tasks);
    } catch (error) {
        console.error('Error getting assigned tasks:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('comments.postedBy', 'name');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => task[update] = req.body[update]);
        
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete task (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.comments.push({
            text: req.body.text,
            postedBy: req.user._id
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update task status (available to assigned user)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Validate status value
        const validStatuses = ['pending', 'in-progress', 'completed', 'on-hold'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value. Must be one of: pending, in-progress, completed, on-hold' 
            });
        }
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if the user is assigned to this task or is an admin
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isAssigned && !isAdmin) {
            return res.status(403).json({ 
                message: 'You are not authorized to update this task status' 
            });
        }
        
        console.log(`Updating task ${task._id} status from ${task.status} to ${status} by user ${req.user._id}`);
        
        // Update status and save
        task.status = status;
        await task.save();
        
        // Return the updated task with populated fields
        const updatedTask = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .populate('createdBy', 'name')
            .populate('comments.postedBy', 'name');
            
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 