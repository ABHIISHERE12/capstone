const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/projects
router.get('/', protect, async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) { res.status(404); throw new Error('Project not found'); }
    res.json(project);
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    const { name, description, members, status } = req.body;
    project.name = name ?? project.name;
    project.description = description ?? project.description;
    project.members = members ?? project.members;
    project.status = status ?? project.status;
    const updated = await project.save();
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) { res.status(404); throw new Error('Project not found'); }
    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
