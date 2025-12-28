import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";

// USER SIGNUP (OPTIONAL)
export const userSignup = async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });
  res.json(user);
};

// USER LOGIN
export const userLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
};

// ADMIN LOGIN ONLY
export const adminLogin = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password)))
    return res.status(401).json({ message: "Invalid admin credentials" });

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET);
  res.json({ token });
};
