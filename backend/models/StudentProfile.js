const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    college: {
      type: String,
      trim: true,
    },

    degree: {
      type: String,
      trim: true,
    },

    branch: {
      type: String,
      trim: true,
    },

    graduationYear: {
      type: Number,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
          default: "beginner",
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
      },
    ],

    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    careerGoal: {
      type: String,
      trim: true,
    },

    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);