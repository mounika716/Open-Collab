const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademiaOpportunity",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicantRole: {
      type: String,
      enum: ["student", "academician", "industry", "institution"],
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    joinedAt: Date,

    completedAt: Date,

    completionNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

collaborationRequestSchema.index(
  { opportunity: 1, applicant: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CollaborationRequest",
  collaborationRequestSchema
);