const { executeQuery } = require('../config/database');

// Get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this project
    const access = await executeQuery(`
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)
    `, [projectId, userId, userId]);

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const tasks = await executeQuery(`
      SELECT 
        t.*,
        CONCAT(assigned_user.first_name, ' ', assigned_user.last_name) as assigned_user_name,
        assigned_user.username as assigned_username,
        CONCAT(creator.first_name, ' ', creator.last_name) as creator_name,
        creator.username as creator_username
      FROM tasks t
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.project_id = ?
      ORDER BY t.position ASC, t.created_at DESC
    `, [projectId]);

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate, estimatedHours } = req.body;
    const userId = req.user.id;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and project ID are required'
      });
    }

    // Check if user has access to create tasks in this project
    const access = await executeQuery(`
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)
    `, [projectId, userId, userId]);

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const result = await executeQuery(`
      INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, due_date, estimated_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, projectId, assignedTo || null, userId, priority || 'medium', dueDate, estimatedHours]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { taskId: result.insertId }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate, estimatedHours, actualHours } = req.body;
    const userId = req.user.id;

    // Check if user has access to update this task
    const task = await executeQuery(`
      SELECT t.*, p.owner_id, pm.role
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      WHERE t.id = ? AND (p.owner_id = ? OR pm.user_id = ? OR t.assigned_to = ?)
    `, [userId, id, userId, userId, userId]);

    if (task.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or task not found'
      });
    }

    await executeQuery(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, estimated_hours = ?, actual_hours = ?
      WHERE id = ?
    `, [title, description, status, priority, assignedTo, dueDate, estimatedHours, actualHours, id]);

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has permission to delete this task
    const task = await executeQuery(`
      SELECT t.*, p.owner_id
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      WHERE t.id = ? AND (p.owner_id = ? OR pm.role IN ('owner', 'admin') OR t.created_by = ?)
    `, [userId, id, userId, userId]);

    if (task.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or task not found'
      });
    }

    await executeQuery('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// Get user's tasks across all projects
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await executeQuery(`
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        CONCAT(assigned_user.first_name, ' ', assigned_user.last_name) as assigned_user_name,
        CONCAT(creator.first_name, ' ', creator.last_name) as creator_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE t.assigned_to = ? OR t.created_by = ? OR p.owner_id = ? OR pm.user_id = ?
      ORDER BY t.due_date ASC, t.created_at DESC
    `, [userId, userId, userId, userId]);

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks
};