const Internship = require("../models/Internship");
const StudentProfile = require("../models/StudentProfile");
const {
  calculateSkillMatch,
} = require("../services/skillMatchingService");

// Get all open internships
const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({
      status: "open",
      applicationDeadline: { $gte: new Date() },
    })
      .populate("industry", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      internships,
    });
  } catch (error) {
    console.error("Get internships error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get internships",
    });
  }
};

// Get one internship
const getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "industry",
      "name email"
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.json({
      success: true,
      internship,
    });
  } catch (error) {
    console.error("Get internship error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get internship",
    });
  }
};

// Industry creates internship
const createInternship = async (req, res) => {
  try {
    const {
      companyName,
      title,
      description,
      location,
      type,
      duration,
      stipend,
      requiredSkills,
      applicationDeadline,
      openings,
    } = req.body;

    if (
      !companyName ||
      !title ||
      !description ||
      !duration ||
      !applicationDeadline ||
      !requiredSkills?.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required internship details",
      });
    }

    const internship = await Internship.create({
      industry: req.user.id,
      companyName,
      title,
      description,
      location,
      type,
      duration,
      stipend,
      requiredSkills,
      applicationDeadline,
      openings,
    });

    res.status(201).json({
      success: true,
      message: "Internship created successfully",
      internship,
    });
  } catch (error) {
    console.error("Create internship error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create internship",
    });
  }
};

// Industry gets its internships
const getMyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({
      industry: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      internships,
    });
  } catch (error) {
    console.error("Get my internships error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get your internships",
    });
  }
};

// Industry updates its internship
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      industry: req.user.id,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    Object.assign(internship, req.body);

    await internship.save();

    res.json({
      success: true,
      message: "Internship updated successfully",
      internship,
    });
  } catch (error) {
    console.error("Update internship error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update internship",
    });
  }
};

// Industry deletes its internship
const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({
      _id: req.params.id,
      industry: req.user.id,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.json({
      success: true,
      message: "Internship deleted successfully",
    });
  } catch (error) {
    console.error("Delete internship error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete internship",
    });
  }
};

// Calculate student's skill match and explain skill gaps
const getInternshipMatch = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    const studentSkills = profile?.skills || [];
    const requiredSkills = internship.requiredSkills || [];

    const match = calculateSkillMatch(
      studentSkills,
      requiredSkills
    );

    const levelLabels = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    };

    const skillResults = match.skillResults.map((result) => {
      const requiredLevel =
        result.requiredLevel || "beginner";

      const studentLevel = result.studentLevel;

      let gap = "none";
      let recommendation = "";

      if (!studentLevel) {
        gap = "missing";
        recommendation =
          `Add ${result.skill} to your profile and start developing it.`;
      } else if (result.status === "strong") {
        gap = "none";
        recommendation =
          `Your ${result.skill} skill is a strong match for this internship.`;
      } else if (result.status === "developing") {
        gap = "score";
        recommendation =
          `Improve your ${result.skill} score toward the ${levelLabels[requiredLevel] || requiredLevel} target.`;
      } else {
        const studentRank =
          result.studentLevel === "advanced"
            ? 3
            : result.studentLevel === "intermediate"
            ? 2
            : 1;

        const requiredRank =
          requiredLevel === "advanced"
            ? 3
            : requiredLevel === "intermediate"
            ? 2
            : 1;

        if (requiredRank > studentRank) {
          gap =
            requiredRank - studentRank === 1
              ? "one-level"
              : "two-level";

          recommendation =
            `Improve ${result.skill} from ${levelLabels[studentLevel] || studentLevel} to ${levelLabels[requiredLevel] || requiredLevel}.`;
        } else {
          gap = "score";
          recommendation =
            `Improve your ${result.skill} score to strengthen your internship match.`;
        }
      }

      return {
        skill: result.skill,
        requiredLevel,
        requiredLevelLabel:
          levelLabels[requiredLevel] || requiredLevel,
        studentLevel,
        studentLevelLabel: studentLevel
          ? levelLabels[studentLevel] || studentLevel
          : "Not added",
        score: result.studentScore,
        studentScore: result.studentScore,
        scoreCompatibility: result.scoreCompatibility,
        compatibility: result.compatibility,
        levelMatched: result.levelMatched,
        matched: result.matched,
        status: result.status,
        gap,
        recommendation,
      };
    });

    const matchedCount = skillResults.filter(
      (skill) => skill.matched
    ).length;

    const skillGaps = skillResults.filter(
      (skill) => !skill.matched
    );

    const matchPercentage = match.percentage;

    res.json({
      success: true,
      matchPercentage,
      matchedCount,
      totalRequiredSkills: skillResults.length,
      readiness:
        matchPercentage >= 80
          ? "strong"
          : matchPercentage >= 60
          ? "developing"
          : "needs-improvement",
      skills: skillResults,
      skillGaps,
      summary: {
        matched: matchedCount,
        gaps: skillGaps.length,
        message:
          skillGaps.length === 0
            ? "Your current skills strongly align with all listed internship requirements."
            : `You have ${skillGaps.length} skill gap${
                skillGaps.length === 1 ? "" : "s"
              } to work on for this internship.`,
      },
    });
  } catch (error) {
    console.error("Internship match error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate internship match",
    });
  }
};
module.exports = {
  getInternships,
  getInternship,
  createInternship,
  getMyInternships,
  updateInternship,
  deleteInternship,
  getInternshipMatch,
};