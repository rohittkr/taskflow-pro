const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Test route (keep for testing) - MUST come before /:id route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Projects routes working!',
    timestamp: new Date().toISOString(),
    user: req.user ? req.user.username : 'Not authenticated',
    endpoints: {
      'GET /': 'Get all user projects',
      'POST /': 'Create new project',
      'GET /:id': 'Get single project',
      'PUT /:id': 'Update project',
      'DELETE /:id': 'Delete project'
    }
  });
});

// Project routes
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { executeQuery } = require('../config/database');

    // Get project with access check
    const projects = await executeQuery(`
      SELECT 
        p.*,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        u.username as owner_username,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)
      GROUP BY p.id
    `, [id, userId, userId]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { project: projects[0] }
    });
  } catch (error) {
    console.error('Get single project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

module.exports = router;