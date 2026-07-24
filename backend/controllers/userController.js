// @desc   Get logged-in user's profile
// @route  GET /api/users/me
export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};