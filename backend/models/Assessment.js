const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "tab_switch",
        "window_blur",
        "fullscreen_exit",
        "copy",
        "cut",
        "paste",
        "right_click",
        "restricted_shortcut",
        "voice_detected",
        "phone_detected",
        "multiple_faces",
        "camera_disabled",
        "microphone_disabled",
      ],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    details: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const submissionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    passedTests: {
      type: Number,
      default: 0,
    },

    totalTests: {
      type: Number,
      default: 0,
    },

    compileError: {
      type: String,
      default: "",
    },

    runtimeError: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      trim: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const assessmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: [
        "mcq",
        "coding",
        "aptitude",
        "soft_skill",
      ],
      default: "coding",
    },

    challengeId: {
      type: String,
      trim: true,
      default: "",
    },

    language: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    starterCode: {
      type: String,
      default: "",
    },

    functionName: {
      type: String,
      default: "solution",
    },

    timeLimitSeconds: {
      type: Number,
      default: 1800,
    },

    status: {
      type: String,
      enum: [
        "not_started",
        "in_progress",
        "completed",
        "terminated",
      ],
      default: "not_started",
    },

    questionIds: [
      {
        type: String,
      },
    ],

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    terminatedAt: {
      type: Date,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    answers: [answerSchema],

    submissions: [submissionSchema],

    latestCode: {
      type: String,
      default: "",
    },

    bestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    warningIssued: {
      type: Boolean,
      default: false,
    },

    violationCount: {
      type: Number,
      default: 0,
    },

    violations: [violationSchema],

    terminationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Assessment",
  assessmentSchema
);