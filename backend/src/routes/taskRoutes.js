const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/tasks?project=<id>
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    res.json(tasks);
  } catch (err) { next(err); }
});

// POST /api/tasks
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;
    const proj = await Project.findById(project);
    if (!proj) { res.status(404); throw new Error('Project not found'); }
    const task = await Task.create({
      title, description, project, assignedTo: assignedTo || null,
      createdBy: req.user._id, status, priority, dueDate,
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    if (!task) { res.status(404); throw new Error('Task not found'); }
    res.json(task);
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) { res.status(404); throw new Error('Task not found'); }
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    const updated = await task.save();
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) { res.status(404); throw new Error('Task not found'); }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
