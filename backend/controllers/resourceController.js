import Resource from '../models/Resource.js';

// @desc   Create a resource (with optional file upload)
// @route  POST /api/resources
// @access Faculty, Admin
export const createResource = async (req, res) => {
  try {
    const { title, description, type, branch, semester, subject, academicYear, tags, externalLink } = req.body;

    if (!title || !type || !branch || !semester || !subject) {
      return res.status(400).json({ message: 'title, type, branch, semester and subject are required' });
    }

    if (type !== 'external-link' && !req.file) {
      return res.status(400).json({ message: 'A file is required for this resource type' });
    }

    const parsedTags = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim())
      : [];

    const resource = await Resource.create({
      title,
      description,
      type,
      branch,
      semester,
      subject,
      academicYear,
      tags: parsedTags,
      externalLink,
      fileUrl: req.file ? req.file.path : '',
      uploadedBy: req.user._id,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};

// @desc   List resources with filtering + pagination
// @route  GET /api/resources
// @access Any logged-in user
export const getResources = async (req, res) => {
  try {
    const { branch, semester, subject, type, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('uploadedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(query),
    ]);

    res.status(200).json({
      resources,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

// @desc   Get a single resource, increments view count
// @route  GET /api/resources/:id
// @access Any logged-in user
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('uploadedBy', 'name role');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resource', error: error.message });
  }
};

// @desc   Update a resource (only the uploader or an admin)
// @route  PUT /api/resources/:id
// @access Faculty (own resources), Admin
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this resource' });
    }

    const allowedFields = ['title', 'description', 'type', 'branch', 'semester', 'subject', 'academicYear', 'tags', 'externalLink'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) resource[field] = req.body[field];
    });

    await resource.save();
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update resource', error: error.message });
  }
};

// @desc   Delete a resource (only the uploader or an admin)
// @route  DELETE /api/resources/:id
// @access Faculty (own resources), Admin
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();
    res.status(200).json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resource', error: error.message });
  }
};