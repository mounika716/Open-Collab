const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    /*
     * Recruitment lifecycle
     *
     * pending
     *   -> shortlisted
     *   -> assessment
     *   -> interview
     *   -> selected
     *   -> offer
     *   -> joined
     *
     * rejected can happen from recruitment stages.
     *
     * "accepted" is retained for old records from the previous system.
     */
    status: {
      type: String,
      enum: [
        "pending",
        "shortlisted",
        "accepted",
        "assessment",
        "interview",
        "selected",
        "offer",
        "joined",
        "rejected",
      ],
      default: "pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    shortlistedAt: Date,
    assessmentAt: Date,
    interviewAt: Date,
    selectedAt: Date,
    offerAt: Date,
    joinedAt: Date,
    rejectedAt: Date,

    assessment: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
      completedAt: Date,
    },

    interview: {
      round: {
        type: String,
        trim: true,
        default: "",
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
      interviewedAt: Date,
    },

    placement: {
      companyName: {
        type: String,
        trim: true,
        default: "",
      },
      role: {
        type: String,
        trim: true,
        default: "",
      },
      package: {
        type: String,
        trim: true,
        default: "",
      },
      offerDate: Date,
      joiningDate: Date,
      offerUrl: {
        type: String,
        trim: true,
        default: "",
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index(
  { job: 1, student: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);