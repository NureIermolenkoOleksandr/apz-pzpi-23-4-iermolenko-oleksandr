import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

const TOKEN_EXPIRY = '24h';

export const register = async (userData) => {
  const { email, password, fullName, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: role || 'TENANT' 
    }
  });

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const login = async (email, password) => {
 
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } };
};