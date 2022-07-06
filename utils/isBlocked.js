exports.isBlocked = (user) => {
  if (user?.isBlocked) {
    throw new Error(`Access is Denied ${user?.firstName} is blocked`);
  }
};
