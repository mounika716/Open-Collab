const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Remote",
      trim: true,
    },

    type: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      default: "remote",
    },

    salary: {
      type: String,
      default: "Not disclosed",
      trim: true,
    },

    experience: {
      type: String,
      default: "Fresher",
      trim: true,
    },

    requiredSkills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        minimumLevel: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
          default: "beginner",
        },
      },
    ],

    applicationDeadline: {
      type: Date,
      required: true,
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);