import Resource from '../models/Resource.js';
import { ingestResource } from '../services/ingestResource.js';
import { getSimilarResources } from '../services/similarResources.js';

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

    ingestResource(resource);

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const { branch, semester, subject, type, search, page = 1, limit = 10, mine } = req.query;

    const query = {};
    if (branch) query.branch = { $regex: branch, $options: 'i' };
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (type) query.type = type;
    if (search) query.$text = { $search: search };
    if (mine === 'true') query.uploadedBy = req.user._id;

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

// @desc   Recent resources — relevant to a student's branch/semester, a
//         faculty member's own uploads, or just recent for admin
// @route  GET /api/resources/recent
export const getRecentResources = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.branch = req.user.branch;
      query.semester = req.user.semester;
    } else if (req.user.role === 'faculty') {
      query.uploadedBy = req.user._id;
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent resources', error: error.message });
  }
};

// @desc   Count of resources by type, across the whole catalog
// @route  GET /api/resources/type-summary
export const getResourceTypeSummary = async (req, res) => {
  try {
    const summary = await Resource.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const total = summary.reduce((acc, s) => acc + s.count, 0);
    res.status(200).json({ summary, total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch type summary', error: error.message });
  }
};

// @desc   Get resources similar to a given resource, via vector similarity
// @route  GET /api/resources/:id/similar
export const getSimilar = async (req, res) => {
  try {
    const similar = await getSimilarResources(req.params.id);
    res.status(200).json(similar);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch similar resources', error: error.message });
  }
};

// @desc   Track a download — increments downloadCount, returns the file/link URL
// @route  GET /api/resources/:id/download
export const trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    const url = resource.fileUrl || resource.externalLink;
    if (!url) {
      return res.status(400).json({ message: 'No file or link available for this resource' });
    }
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track download', error: error.message });
  }
};