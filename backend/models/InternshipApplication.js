const mongoose = require("mongoose");

const internshipApplicationSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
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

    status: {
      type: String,
      enum: [
        "pending",
        "shortlisted",
        "accepted",
        "rejected",
        "joined",
        "in_progress",
        "completed",
      ],
      default: "pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    shortlistedAt: {
      type: Date,
    },

    acceptedAt: {
      type: Date,
    },

    joinedAt: {
      type: Date,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    evaluation: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },

      feedback: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      skillsDemonstrated: [
        {
          type: String,
          trim: true,
        },
      ],

      evaluatedAt: {
        type: Date,
      },
    },

    completionNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },

      name: {
        type: String,
        trim: true,
      },

      issuer: {
        type: String,
        trim: true,
      },

      issueDate: {
        type: Date,
      },

      url: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

internshipApplicationSchema.index(
  { internship: 1, student: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "InternshipApplication",
  internshipApplicationSchema
);