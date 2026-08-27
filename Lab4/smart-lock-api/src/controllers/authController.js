import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const data = await authService.login(email, password);
    res.json(data);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user }); 
};