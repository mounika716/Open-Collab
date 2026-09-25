const mongoose = require("mongoose");

const institutionProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    institutionName: {
      type: String,
      trim: true,
    },

    institutionType: {
      type: String,
      enum: [
        "university",
        "college",
        "engineering_college",
        "degree_college",
        "polytechnic",
        "training_institute",
        "other",
      ],
      default: "college",
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    establishedYear: {
      type: Number,
      min: 1000,
      max: 2100,
    },

    affiliation: {
      type: String,
      trim: true,
    },

    accreditation: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InstitutionProfile",
  institutionProfileSchema
);
