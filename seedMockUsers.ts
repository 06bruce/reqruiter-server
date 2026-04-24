import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { connectDB } from "./src/config/database";
import { Recruiter } from "./src/models/Recruiter.model";
import { Candidate } from "./src/models/Candidate.model";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to DB");

    // Clear existing mock data
    await Recruiter.deleteMany({ email: "brucenshuti2@gmail.com" });
    await Candidate.deleteMany({ email: { $in: ["john.doe@example.com", "jane.smith@example.com"] } });

    // Create Recruiter
    const password = "804C23DD12";
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const mockRecruiter = await Recruiter.create({
      name: "Mock Recruiter",
      email: "brucenshuti2@gmail.com",
      password: hashedPassword,
      role: "HR_MANAGER"
    });
    console.log(`Created Mock Recruiter: ${mockRecruiter.email} / ${password}`);

    // Create Mock Candidates
    const mockCandidates = await Candidate.insertMany([
      {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        positionApplied: "Software Engineer",
        department: "Engineering",
        cvFileName: "john_doe_cv.pdf",
        cvFilePath: "/uploads/john_doe_cv.pdf",
        status: "PENDING",
        matchScore: 85,
        strengths: ["React", "Node.js", "TypeScript"],
        weaknesses: ["Python"],
        aiSummary: "Strong candidate with solid frontend and backend skills in JavaScript ecosystem."
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1987654321",
        positionApplied: "Product Manager",
        department: "Product",
        cvFileName: "jane_smith_cv.pdf",
        cvFilePath: "/uploads/jane_smith_cv.pdf",
        status: "PENDING_INTERVIEW",
        matchScore: 92,
        strengths: ["Agile", "Scrum", "User Research", "Data Analysis"],
        weaknesses: ["Technical implementation"],
        aiSummary: "Excellent communication skills and deep understanding of product lifecycle."
      }
    ]);
    
    console.log(`Created ${mockCandidates.length} mock candidates.`);
    console.log("Seeding complete!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed", error);
    process.exit(1);
  }
};

seed();
