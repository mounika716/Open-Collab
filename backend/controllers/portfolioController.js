const StudentProfile = require("../models/StudentProfile");
const Assessment = require("../models/Assessment");
const InternshipApplication = require("../models/InternshipApplication");
const JobApplication = require("../models/JobApplication");

const getStudentPortfolio = async (req, res) => {
  try {
    const studentId = req.user.id;

    const profile = await StudentProfile.findOne({
      user: studentId,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const [assessments, internships, placements] =
      await Promise.all([
        Assessment.find({
          student: studentId,
          status: "completed",
        })
          .select(
            "skill mode title status score bestScore submissions completedAt createdAt"
          )
          .sort({ completedAt: -1 })
          .lean(),

        InternshipApplication.find({
          student: studentId,
        })
          .populate(
            "internship",
            "companyName title description location type duration stipend"
          )
          .sort({ appliedAt: -1 })
          .lean(),

        JobApplication.find({
          student: studentId,
        })
          .populate(
            "job",
            "companyName title description location type salary experience"
          )
          .sort({ appliedAt: -1 })
          .lean(),
      ]);

    const completedAssessments = assessments.filter(
      (assessment) =>
        assessment.status === "completed"
    );

    const completedInternships = internships.filter(
      (application) =>
        application.status === "completed"
    );

    const placementApplications =
      placements.filter((application) =>
        ["selected", "offer", "joined"].includes(
          application.status
        )
      );

    const issuedCertificates =
      completedInternships.filter(
        (application) =>
          application.certificate?.issued
      );

    const assessmentAverage =
      completedAssessments.length > 0
        ? Math.round(
            completedAssessments.reduce(
              (total, assessment) =>
                total +
                (assessment.score || 0),
              0
            ) /
              completedAssessments.length
          )
        : 0;

    const portfolio = {
      profile: {
        name: profile.name || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        graduationYear:
          profile.graduationYear || "",
        bio: profile.bio || "",
        careerGoal:
          profile.careerGoal || "",
        interests:
          profile.interests || [],
      },

      skills: profile.skills || [],

      projects: profile.projects || [],

      certifications:
        profile.certifications || [],

      assessments: completedAssessments,

      internships,

      placements,

      statistics: {
        skills:
          profile.skills?.length || 0,

        projects:
          profile.projects?.length || 0,

        certifications:
          (profile.certifications?.length || 0) +
          issuedCertificates.length,

        completedAssessments:
          completedAssessments.length,

        assessmentAverage,

        completedInternships:
          completedInternships.length,

        placementApplications:
          placementApplications.length,

        totalApplications:
          internships.length +
          placements.length,
      },
    };

    return res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error(
      "Get student portfolio error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load student portfolio",
    });
  }
};

module.exports = {
  getStudentPortfolio,
};