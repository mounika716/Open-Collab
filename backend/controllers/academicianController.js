const AcademicianProfile = require("../models/AcademicianProfile");
const AcademiaOpportunity = require("../models/AcademiaOpportunity");
const getProfile = async (req, res) => {
  try {
    let profile = await AcademicianProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      profile = await AcademicianProfile.create({
        user: req.user.id,
        qualifications: [],
        areasOfInterest: [],
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get academician profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get academician profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await AcademicianProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: req.body,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update academician profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update academician profile",
    });
  }
};
const getDashboard = async (req, res) => {
  try {
    const [profile, myOpportunities, openOpportunities] =
      await Promise.all([
        AcademicianProfile.findOne({
          user: req.user.id,
        }),

        AcademiaOpportunity.find({
          createdBy: req.user.id,
        })
          .sort({ createdAt: -1 })
          .limit(5),

        AcademiaOpportunity.countDocuments({
          status: "open",
        }),
      ]);

    const profileFields = [
      "phone",
      "institution",
      "department",
      "designation",
      "specialization",
      "experienceYears",
      "bio",
      "linkedin",
      "website",
    ];

    const completedFields = profileFields.filter(
      (field) => {
        const value = profile?.[field];

        if (value === undefined || value === null) {
          return false;
        }

        return String(value).trim().length > 0;
      }
    ).length;

    const profileCompletion = Math.round(
      (completedFields / profileFields.length) * 100
    );

    res.json({
      success: true,
      dashboard: {
        profileCompletion,
        myOpportunityCount: await AcademiaOpportunity.countDocuments({
          createdBy: req.user.id,
        }),
        openOpportunityCount: openOpportunities,
        recentOpportunities: myOpportunities,
      },
    });
  } catch (error) {
    console.error(
      "Get academician dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load academician dashboard",
    });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
};
