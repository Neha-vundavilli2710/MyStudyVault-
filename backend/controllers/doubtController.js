import Doubt from '../models/Doubt.js';
import Notification from '../models/Notification.js';

export const createDoubt = async (req, res) => {
  try {
    const { subject, branch, title, description, relatedResource } = req.body;

    if (!subject || !title || !description) {
      return res.status(400).json({ message: 'subject, title and description are required' });
    }

    const doubt = await Doubt.create({
      student: req.user._id,
      subject,
      branch,
      title,
      description,
      relatedResource: relatedResource || null,
    });

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create doubt', error: error.message });
  }
};

export const getDoubts = async (req, res) => {
  try {
    const { subject, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (subject) query.subject = subject;
    if (status) query.status = status;

    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [doubts, total] = await Promise.all([
      Doubt.find(query)
        .populate('student', 'name branch semester')
        .populate('answers.faculty', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Doubt.countDocuments(query),
    ]);

    res.status(200).json({
      doubts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doubts', error: error.message });
  }
};

export const answerDoubt = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    doubt.answers.push({ faculty: req.user._id, text });
    if (doubt.status === 'open') {
      doubt.status = 'answered';
    }

    await doubt.save();
    await doubt.populate('answers.faculty', 'name');

    await Notification.create({
      user: doubt.student,
      type: 'doubt-answered',
      message: `Your doubt "${doubt.title}" was answered.`,
      link: '/doubts',
    });

    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to answer doubt', error: error.message });
  }
};

export const resolveDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the student who posted this doubt can resolve it' });
    }

    doubt.status = 'resolved';
    await doubt.save();

    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve doubt', error: error.message });
  }
};