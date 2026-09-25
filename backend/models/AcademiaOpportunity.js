const mongoose = require("mongoose");

const academiaOpportunitySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdByRole: {
      type: String,
      enum: [
        "academician",
        "industry",
        "institution",
      ],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "faculty_internship",
        "industrial_training",
        "fdp",
        "workshop",
        "consultancy",
        "research",
        "guest_lecture",
        "mentorship",
        "live_project",
        "innovation_challenge",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    organization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    mode: {
      type: String,
      enum: [
        "online",
        "offline",
        "hybrid",
      ],
      default: "online",
    },

    location: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    deadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "open",
        "closed",
        "draft",
      ],
      default: "open",
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      trim: true,
    },

    seats: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

academiaOpportunitySchema.index({
  type: 1,
  status: 1,
});

academiaOpportunitySchema.index({
  organization: 1,
});

academiaOpportunitySchema.index({
  createdBy: 1,
});

module.exports = mongoose.model(
  "AcademiaOpportunity",
  academiaOpportunitySchema
);
