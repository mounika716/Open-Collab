const AcademiaOpportunity = require("../models/AcademiaOpportunity");

const allowedCreatorRoles = [
  "academician",
  "industry",
  "institution",
];

const getOpportunities = async (req, res) => {
  try {
    const filter = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = "open";
    }

    const opportunities = await AcademiaOpportunity.find(filter)
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error(
      "Get academia opportunities error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get opportunities",
    });
  }
};

const getMyOpportunities = async (req, res) => {
  try {
    const opportunities =
      await AcademiaOpportunity.find({
        createdBy: req.user.id,
      }).sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      opportunities,
    });
  } catch (error) {
    console.error(
      "Get my academia opportunities error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get your opportunities",
    });
  }
};

const createOpportunity = async (req, res) => {
  try {
    if (!allowedCreatorRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to create this opportunity",
      });
    }

    const {
      type,
      title,
      organization,
      description,
      skills,
      mode,
      location,
      startDate,
      endDate,
      deadline,
      contactEmail,
      website,
      seats,
      status,
    } = req.body;

    if (
      !type ||
      !title ||
      !organization ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type, title, organization and description are required",
      });
    }

    const opportunity =
      await AcademiaOpportunity.create({
        createdBy: req.user.id,
        createdByRole: req.user.role,
        type,
        title,
        organization,
        description,
        skills: Array.isArray(skills)
          ? skills
          : [],
        mode: mode || "online",
        location,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deadline: deadline || undefined,
        contactEmail,
        website,
        seats: seats || 1,
        status: status || "open",
      });

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      opportunity,
    });
  } catch (error) {
    console.error(
      "Create academia opportunity error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create opportunity",
    });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const opportunity =
      await AcademiaOpportunity.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const allowedFields = [
      "type",
      "title",
      "organization",
      "description",
      "skills",
      "mode",
      "location",
      "startDate",
      "endDate",
      "deadline",
      "contactEmail",
      "website",
      "seats",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        opportunity[field] = req.body[field];
      }
    });

    await opportunity.save();

    res.json({
      success: true,
      message: "Opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    console.error(
      "Update academia opportunity error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update opportunity",
    });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity =
      await AcademiaOpportunity.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user.id,
      });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete academia opportunity error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete opportunity",
    });
  }
};

module.exports = {
  getOpportunities,
  getMyOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
