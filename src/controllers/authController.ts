import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export async function register(req: Request, res: Response) {
const hashedPassword = await bcrypt.hash(req.body.password, 10);

const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
});

const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
);

return res.status(201).json({
    token,
    user: {
    id: user._id,
    name: user.name,
    email: user.email,
    },
});
}

export async function login(req: Request, res: Response) {
const user = await User.findOne({
    email: req.body.email,
});

if (!user) {
    return res.status(401).json({
    message: "Invalid credentials",
    });
}

const valid = await bcrypt.compare(
    req.body.password,
    user.password
);

if (!valid) {
    return res.status(401).json({
    message: "Invalid credentials",
    });
}

const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
);

return res.status(200).json({
    token,
    user: {
    id: user._id,
    name: user.name,
    email: user.email,
    },
});
}

