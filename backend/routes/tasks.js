const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getUserTasks } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Root endpoint - Add this to handle GET /api/tasks
router.get('/', (req, res) => {
  res.json({
    message: 'Tasks API endpoint',
    user: req.user.username,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      'GET /': 'This endpoint - API info',
      'GET /test': 'Test endpoint with detailed info',
      'GET /my-tasks': 'Get all your tasks',
      'GET /project/:projectId': 'Get tasks for a specific project',
      'POST /': 'Create new task',
      'GET /:id': 'Get single task by ID',
      'PUT /:id': 'Update task',
      'DELETE /:id': 'Delete task',
      'GET /:id/comments': 'Get task comments',
      'POST /:id/comments': 'Add task comment'
    }
  });
});

// Test route (keep for testing) - MUST come before other routes
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Tasks routes working!',
    timestamp: new Date().toISOString(),
    user: req.user ? req.user.username : 'Not authenticated',
    endpoints: {
      'GET /my-tasks': 'Get all user tasks',
      'GET /project/:projectId': 'Get tasks for a project',
      'POST /': 'Create new task',
      'GET /:id': 'Get single task',
      'PUT /:id': 'Update task',
      'DELETE /:id': 'Delete task',
      'GET /:id/comments': 'Get task comments',
      'POST /:id/comments': 'Add task comment'
    }
  });
});

// Task routes
router.get('/my-tasks', getUserTasks);
router.get('/project/:projectId', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { executeQuery } = require('../config/database');

    // Get task with access check
    const tasks = await executeQuery(`
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        CONCAT(assigned_user.first_name, ' ', assigned_user.last_name) as assigned_user_name,
        assigned_user.username as assigned_username,
        CONCAT(creator.first_name, ' ', creator.last_name) as creator_name,
        creator.username as creator_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.id = ? AND (p.owner_id = ? OR pm.user_id = ? OR t.assigned_to = ? OR t.created_by = ?)
    `, [id, userId, userId, userId, userId]);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { task: tasks[0] }
    });
  } catch (error) {
    console.error('Get single task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
});

// Get task comments (bonus feature)
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { executeQuery } = require('../config/database');

    // Check if user has access to this task
    const access = await executeQuery(`
      SELECT 1 FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.id = ? AND (p.owner_id = ? OR pm.user_id = ? OR t.assigned_to = ?)
    `, [id, userId, userId, userId]);

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    const comments = await executeQuery(`
      SELECT 
        tc.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.username
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('Get task comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// Add task comment (bonus feature)
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const { executeQuery } = require('../config/database');

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Check if user has access to this task
    const access = await executeQuery(`
      SELECT 1 FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.id = ? AND (p.owner_id = ? OR pm.user_id = ? OR t.assigned_to = ?)
    `, [id, userId, userId, userId]);

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    await executeQuery(`
      INSERT INTO task_comments (task_id, user_id, comment)
      VALUES (?, ?, ?)
    `, [id, userId, comment]);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

module.exports = router;