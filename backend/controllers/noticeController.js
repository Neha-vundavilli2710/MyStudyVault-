import Notice from '../models/Notice.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotice = async (req, res) => {
  try {
    const { title, description, category, branch, semester, priority, eventDate, expiryDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'title and description are required' });
    }

    const notice = await Notice.create({
      title,
      description,
      category,
      branch,
      semester: semester || null,
      priority,
      eventDate: eventDate || null,
      expiryDate: expiryDate || null,
      postedBy: req.user._id,
    });

    // Notify matching students (same branch/semester logic as getNotices)
    const studentQuery = { role: 'student' };
    if (branch) studentQuery.branch = branch;
    if (semester) studentQuery.semester = Number(semester);

    const matchingStudents = await User.find(studentQuery).select('_id');
    const notifications = matchingStudents.map((s) => ({
      user: s._id,
      type: 'new-notice',
      message: `New notice: ${notice.title}`,
      link: '/notices',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notice', error: error.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const query = {
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    };

    if (req.user.role === 'student') {
      query.$and = [
        { $or: [{ branch: '' }, { branch: req.user.branch }] },
        { $or: [{ semester: null }, { semester: req.user.semester }] },
      ];
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const isOwner = notice.postedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await notice.deleteOne();
    res.status(200).json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notice', error: error.message });
  }
};