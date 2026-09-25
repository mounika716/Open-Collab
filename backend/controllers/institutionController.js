const InstitutionProfile = require("../models/InstitutionProfile");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Internship = require("../models/Internship");
const InternshipApplication = require("../models/InternshipApplication");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const AcademiaOpportunity = require("../models/AcademiaOpportunity");
const Assessment = require("../models/Assessment");
const getProfile = async (req, res) => {
  try {
    let profile = await InstitutionProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      profile = await InstitutionProfile.create({
        user: req.user.id,
        accreditation: [],
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get institution profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get institution profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "institutionName",
      "institutionType",
      "phone",
      "email",
      "website",
      "address",
      "city",
      "state",
      "description",
      "establishedYear",
      "affiliation",
      "accreditation",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await InstitutionProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Institution profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update institution profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update institution profile",
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const [
      profile,
      students,
      academicians,
      industries,
      internships,
      openInternships,
      jobs,
      openJobs,
      internshipApplications,
      acceptedInternships,
      jobApplications,
      acceptedJobs,
      opportunities,
    ] = await Promise.all([
      InstitutionProfile.findOne({ user: req.user.id }),

      User.countDocuments({
        role: "student",
        isActive: true,
      }),

      User.countDocuments({
        role: "academician",
        isActive: true,
      }),

      User.countDocuments({
        role: "industry",
        isActive: true,
      }),

      Internship.countDocuments(),

      Internship.countDocuments({
        status: "open",
      }),

      Job.countDocuments(),

      Job.countDocuments({
        status: "open",
      }),

      InternshipApplication.countDocuments(),

      InternshipApplication.countDocuments({
        status: "accepted",
      }),

      JobApplication.countDocuments(),

      JobApplication.countDocuments({
        status: "accepted",
      }),

      AcademiaOpportunity.countDocuments({
        status: "open",
      }),
    ]);

    const profileFields = [
      "institutionName",
      "institutionType",
      "phone",
      "email",
      "website",
      "address",
      "city",
      "state",
      "description",
      "affiliation",
    ];

    const completedFields = profileFields.filter(
      (field) =>
        profile?.[field] !== undefined &&
        profile?.[field] !== null &&
        String(profile[field]).trim().length > 0
    ).length;

    const profileCompletion = Math.round(
      (completedFields / profileFields.length) * 100
    );

    res.json({
      success: true,
      dashboard: {
        profileCompletion,
        students,
        academicians,
        industries,
        internships,
        openInternships,
        jobs,
        openJobs,
        internshipApplications,
        acceptedInternships,
        jobApplications,
        acceptedJobs,
        openAcademicOpportunities: opportunities,
      },
    });
  } catch (error) {
    console.error("Get institution dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load institution dashboard",
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      studentsWithSkills,
      totalCertifications,
      totalProjects,
      topSkills,
      completedAssessments,
      assessmentAverage,
      openInternships,
      openJobs,
    ] = await Promise.all([
      User.countDocuments({
        role: "student",
        isActive: true,
      }),

      StudentProfile.countDocuments({
        "skills.0": { $exists: true },
      }),

      StudentProfile.aggregate([
        {
          $project: {
            count: {
              $size: {
                $ifNull: ["$certifications", []],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
          },
        },
      ]),

      StudentProfile.aggregate([
        {
          $project: {
            count: {
              $size: {
                $ifNull: ["$projects", []],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
          },
        },
      ]),

      StudentProfile.aggregate([
        {
          $unwind: "$skills",
        },
        {
          $group: {
            _id: {
              $toLower: "$skills.name",
            },
            count: {
              $sum: 1,
            },
            averageScore: {
              $avg: {
                $ifNull: [
                  "$skills.score",
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 8,
        },
      ]),

      Assessment.countDocuments({
        status: "completed",
      }),

      Assessment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: "$score",
            },
          },
        },
      ]),

      Internship.find({
        status: "open",
      }).select("requiredSkills"),

      Job.find({
        status: "open",
      }).select("requiredSkills"),
    ]);

    const certificationCount =
      totalCertifications[0]?.total || 0;

    const projectCount =
      totalProjects[0]?.total || 0;

    const skillCoverage =
      totalStudents === 0
        ? 0
        : Math.round(
            (studentsWithSkills /
              totalStudents) *
              100
          );

    const demandMap = new Map();

    const addDemand = (
      items,
      source
    ) => {
      items.forEach((item) => {
        (item.requiredSkills || []).forEach(
          (requiredSkill) => {
            const name =
              requiredSkill.name?.trim();

            if (!name) return;

            const key =
              name.toLowerCase();

            if (!demandMap.has(key)) {
              demandMap.set(key, {
                name,
                demand: 0,
                internships: 0,
                jobs: 0,
              });
            }

            const entry =
              demandMap.get(key);

            entry.demand += 1;

            if (
              source ===
              "internship"
            ) {
              entry.internships += 1;
            } else {
              entry.jobs += 1;
            }
          }
        );
      });
    };

    addDemand(
      openInternships,
      "internship"
    );

    addDemand(
      openJobs,
      "job"
    );

    const industryDemand =
      Array.from(
        demandMap.values()
      )
        .sort(
          (a, b) =>
            b.demand - a.demand
        )
        .slice(0, 8);

    const averageAssessmentScore =
      Math.round(
        assessmentAverage[0]
          ?.average || 0
      );

    const [
      selectedJobs,
      offerJobs,
      joinedJobs,
      completedInternships,
      openAcademicOpportunities,
    ] = await Promise.all([
      JobApplication.countDocuments({
        status: "selected",
      }),

      JobApplication.countDocuments({
        status: "offer",
      }),

      JobApplication.countDocuments({
        status: "joined",
      }),

      InternshipApplication.countDocuments({
        status: "completed",
      }),

      AcademiaOpportunity.countDocuments({
        status: "open",
      }),
    ]);

    res.json({
      success: true,

      analytics: {
        totalStudents,
        studentsWithSkills,
        skillCoverage,
        certificationCount,
        projectCount,

        completedAssessments,
        averageAssessmentScore,

        topSkills:
          topSkills.map((skill) => ({
            name: skill._id,
            count: skill.count,
            averageScore:
              Math.round(
                skill.averageScore || 0
              ),
          })),

        industryDemand: {
          openInternships:
            openInternships.length,
          openJobs:
            openJobs.length,
          totalDemandedSkills:
            demandMap.size,
          skills: industryDemand,
        },

        placement: {
          selectedJobs,
          offerJobs,
          joinedJobs,
          completedInternships,
          openAcademicOpportunities,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get institution analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load institution analytics",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getAnalytics,
};