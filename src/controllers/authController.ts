import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/jwt";

export const register = async (req: Request, res: Response, next: NextFunction) => {
try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
    return res.status(400).json({
        error: {
        message: "Email already exists"
        }
    });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
    name,
    email,
    password: hashedPassword
    });

    res.status(201).json({
    message: "User registered successfully",
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
    });

} catch (error) {
    next(error);
}
};
export async function login(
    req: Request,
    res: Response,
    next: NextFunction
    ) {
    try {
        const user = await User.findOne({
        email: req.body.email,
        });

        if (!user) {
        return res.status(401).json({
            error: {
            message: "Invalid credentials",
            },
        });
        }

        const valid = await bcrypt.compare(
        req.body.password,
        user.password
        );

        if (!valid) {
        return res.status(401).json({
            error: {
            message: "Invalid credentials",
            },
        });
        }

        const token = generateToken(user._id.toString());

        return res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        });

    } catch (error) {
        next(error);
    
}
    }
