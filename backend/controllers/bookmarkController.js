import Bookmark from '../models/Bookmark.js';

export const addBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.create({
      user: req.user._id,
      resource: req.params.resourceId,
    });
    res.status(201).json(bookmark);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }
    res.status(500).json({ message: 'Failed to add bookmark', error: error.message });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const result = await Bookmark.findOneAndDelete({
      user: req.user._id,
      resource: req.params.resourceId,
    });

    if (!result) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.status(200).json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove bookmark', error: error.message });
  }
};

export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'resource',
        populate: { path: 'uploadedBy', select: 'name role' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarks', error: error.message });
  }
};