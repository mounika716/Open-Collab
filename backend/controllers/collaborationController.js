const CollaborationRequest = require("../models/CollaborationRequest");
const AcademiaOpportunity = require("../models/AcademiaOpportunity");

const applyForCollaboration = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { message = "" } = req.body;

    const opportunity = await AcademiaOpportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (opportunity.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This opportunity is not accepting requests",
      });
    }

    if (
      opportunity.deadline &&
      new Date(opportunity.deadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    if (String(opportunity.createdBy) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own opportunity",
      });
    }

    const existing = await CollaborationRequest.findOne({
      opportunity: opportunityId,
      applicant: req.user.id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already requested this opportunity",
      });
    }

    const request = await CollaborationRequest.create({
      opportunity: opportunityId,
      applicant: req.user.id,
      applicantRole: req.user.role,
      message,
    });

    const populated = await CollaborationRequest.findById(request._id)
      .populate("opportunity")
      .populate("applicant", "name email role");

    res.status(201).json({
      success: true,
      message: "Collaboration request submitted",
      request: populated,
    });
  } catch (error) {
    console.error("Apply collaboration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit collaboration request",
    });
  }
};

const getMyCollaborationRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({
      applicant: req.user.id,
    })
      .populate("opportunity")
      .populate("applicant", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get my collaborations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load collaboration requests",
    });
  }
};

const getOpportunityRequests = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const opportunity = await AcademiaOpportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (String(opportunity.createdBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these requests",
      });
    }

    const requests = await CollaborationRequest.find({
      opportunity: opportunityId,
    })
      .populate("applicant", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get opportunity requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load collaboration requests",
    });
  }
};

const updateCollaborationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, completionNote, progress } = req.body;

    const request = await CollaborationRequest.findById(id).populate(
      "opportunity"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collaboration request not found",
      });
    }

    const opportunity = request.opportunity;

    const isCreator =
      String(opportunity.createdBy) === String(req.user.id);

    const applicantId =
        request.applicant?._id || request.applicant;

        const isApplicant =
        String(applicantId) === String(req.user.id);

    if (!isCreator && !isApplicant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const creatorStatuses = [
      "approved",
      "rejected",
      "active",
      "completed",
    ];

    if (creatorStatuses.includes(status) && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the opportunity creator can set this status",
      });
    }

    if (
      status &&
      ![
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid collaboration status",
      });
    }

    if (status) {
      request.status = status;

      if (status === "approved" && !request.joinedAt) {
        request.joinedAt = new Date();
      }

      if (status === "completed") {
        request.completedAt = new Date();
        request.progress = 100;
      }
    }

    if (progress !== undefined) {
      request.progress = Math.max(
        0,
        Math.min(100, Number(progress))
      );
    }

    if (feedback !== undefined) {
      request.feedback = feedback;
    }

    if (completionNote !== undefined) {
      request.completionNote = completionNote;
    }

    await request.save();

    const populated = await CollaborationRequest.findById(request._id)
      .populate("opportunity")
      .populate("applicant", "name email role");

    res.json({
      success: true,
      message: "Collaboration updated",
      request: populated,
    });
  } catch (error) {
    console.error("Update collaboration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update collaboration",
    });
  }
};

module.exports = {
  applyForCollaboration,
  getMyCollaborationRequests,
  getOpportunityRequests,
  updateCollaborationStatus,
};