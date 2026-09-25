const mongoose = require("mongoose");

const academicianProfileSchema = new mongoose.Schema(
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

    institution: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],

    experienceYears: {
      type: Number,
      min: 0,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    areasOfInterest: [
      {
        type: String,
        trim: true,
      },
    ],

    linkedin: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AcademicianProfile",
  academicianProfileSchema
);
