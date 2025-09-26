const { executeQuery } = require('../config/database');

// Get all projects for the authenticated user
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

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
      WHERE p.owner_id = ? OR pm.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [userId, userId]);

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description, color, priority, startDate, dueDate } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const result = await executeQuery(`
      INSERT INTO projects (name, description, color, owner_id, priority, start_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, description, color || '#3B82F6', userId, priority || 'medium', startDate, dueDate]);

    const projectId = result.insertId;

    // Add owner as project member
    await executeQuery(`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (?, ?, 'owner')
    `, [projectId, userId]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { projectId }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, priority, status, startDate, dueDate } = req.body;
    const userId = req.user.id;

    // Check if user has permission to update this project
    const project = await executeQuery(`
      SELECT p.* FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = ? AND (p.owner_id = ? OR (pm.user_id = ? AND pm.role IN ('owner', 'admin')))
    `, [id, userId, userId]);

    if (project.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or project not found'
      });
    }

    await executeQuery(`
      UPDATE projects 
      SET name = ?, description = ?, color = ?, priority = ?, status = ?, start_date = ?, due_date = ?
      WHERE id = ?
    `, [name, description, color, priority, status, startDate, dueDate, id]);

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the owner
    const project = await executeQuery(`
      SELECT * FROM projects WHERE id = ? AND owner_id = ?
    `, [id, userId]);

    if (project.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or project not found'
      });
    }

    await executeQuery('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};