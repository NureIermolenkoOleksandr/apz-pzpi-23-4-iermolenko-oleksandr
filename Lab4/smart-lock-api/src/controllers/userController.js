import * as userService from '../services/userService.js';

export const listUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
  
    const validRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'SECURITY', 'MAINTENANCE', 'TENANT', 'AUDITOR'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    }

    const updatedUser = await userService.updateUserRole(id, role);
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};




export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive, fullName } = req.body; 
  
    const updateData = {};

    if (role) {
      const validRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'SECURITY', 'MAINTENANCE', 'TENANT', 'AUDITOR'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Allowed: ${validRoles.join(', ')}` });
      }
      updateData.role = role;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }

    const updatedUser = await userService.updateUser(id, updateData);
  
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};