const StudentProfile = require("../models/StudentProfile");
const Assessment = require("../models/Assessment");
const Internship = require("../models/Internship");
const Job = require("../models/Job");
const InternshipApplication = require("../models/InternshipApplication");
const JobApplication = require("../models/JobApplication");
const {
  calculateSkillMatch,
} = require("../services/skillMatchingService");

const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user.id,
        skills: [],
        interests: [],
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get student profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "phone",
      "college",
      "degree",
      "branch",
      "graduationYear",
      "bio",
      "skills",
      "interests",
      "careerGoal",
      "certifications",
      "projects",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await StudentProfile.findOneAndUpdate(
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
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update student profile",
    });
  }
};

const getCareerIntelligence = async (req, res) => {
  try {
    const [profile, assessments] = await Promise.all([
      StudentProfile.findOne({
        user: req.user.id,
      }),

      Assessment.find({
        student: req.user.id,
        status: "completed",
      })
        .sort({ completedAt: -1 })
        .limit(10)
        .select(
          "skill score correctAnswers totalQuestions completedAt"
        ),
    ]);

    const skills = profile?.skills || [];
    const interests = profile?.interests || [];
    const careerGoal = profile?.careerGoal || "";

    const strengths = skills
      .filter((skill) => Number(skill.score) >= 70)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 5)
      .map((skill) => ({
        name: skill.name,
        score: Number(skill.score) || 0,
        level: skill.level,
      }));

    const skillGaps = skills
      .filter((skill) => Number(skill.score) < 70)
      .sort((a, b) => Number(a.score) - Number(b.score))
      .slice(0, 6)
      .map((skill) => ({
        name: skill.name,
        score: Number(skill.score) || 0,
        level: skill.level,
        priority:
          Number(skill.score) < 40
            ? "high"
            : "medium",
      }));

    const knownSkills = skills.map((skill) =>
      skill.name.toLowerCase()
    );

    const text = [
      careerGoal,
      ...interests,
      ...knownSkills,
    ]
      .join(" ")
      .toLowerCase();

    const careerTracks = [
      {
        title: "Full Stack Developer",
        keywords: [
          "web",
          "frontend",
          "backend",
          "react",
          "javascript",
          "node",
          "full stack",
        ],
        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "SQL",
          "Git",
        ],
      },
      {
        title: "Data & AI Engineer",
        keywords: [
          "data",
          "ai",
          "machine learning",
          "ml",
          "python",
          "analytics",
        ],
        skills: [
          "Python",
          "SQL",
          "Machine Learning",
          "Statistics",
          "Data Structures",
        ],
      },
      {
        title: "Cloud & DevOps Engineer",
        keywords: [
          "cloud",
          "devops",
          "aws",
          "azure",
          "deployment",
        ],
        skills: [
          "Linux",
          "Git",
          "Docker",
          "AWS",
          "Networking",
        ],
      },
      {
        title: "Software Engineer",
        keywords: [
          "software",
          "developer",
          "development",
          "coding",
          "programming",
        ],
        skills: [
          "Data Structures",
          "Algorithms",
          "OOP",
          "SQL",
          "Git",
        ],
      },
    ];

    const rankedTracks = careerTracks
      .map((track) => {
        const matches = track.keywords.filter((keyword) =>
          text.includes(keyword)
        ).length;

        return {
          ...track,
          matches,
        };
      })
      .sort((a, b) => b.matches - a.matches);

    const selectedTracks =
      rankedTracks.filter(
        (track) => track.matches > 0
      );

    const recommendedSkills = Array.from(
      new Set(
        selectedTracks
          .flatMap((track) => track.skills)
          .filter(
            (skill) =>
              !knownSkills.includes(
                skill.toLowerCase()
              )
          )
      )
    ).slice(0, 8);

    const latestAssessment =
      assessments.length > 0
        ? assessments[0]
        : null;

    res.json({
      success: true,
      intelligence: {
        careerGoal,
        strengths,
        skillGaps,
        recommendedSkills,
        careerTracks: selectedTracks.map(
          (track) => ({
            title: track.title,
            matchedKeywords: track.matches,
          })
        ),
        latestAssessment,
        assessmentCount: assessments.length,
      },
    });
  } catch (error) {
    console.error(
      "Career intelligence error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate career intelligence",
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).lean();

    const studentSkills = profile?.skills || [];

    const interests = (profile?.interests || [])
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean);

    const careerGoal =
      profile?.careerGoal?.toLowerCase().trim() || "";

    const [internships, jobs] = await Promise.all([
      Internship.find({
        status: "open",
        applicationDeadline: { $gte: new Date() },
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),

      Job.find({
        status: "open",
        applicationDeadline: { $gte: new Date() },
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
    ]);

    const calculateMatch = (requiredSkills = []) => {
      const match = calculateSkillMatch(
        studentSkills,
        requiredSkills
      );

      return {
        percentage: match.percentage,
        matchedSkills: match.matchedSkills.map(
          (skill) => skill.skill
        ),
        missingSkills: match.missingSkills.map(
          (skill) => skill.skill
        ),
        skillResults: match.skillResults,
      };
    };
    const keywordScore = (
      title = "",
      description = "",
      company = ""
    ) => {
      const text =
        `${title} ${description} ${company}`.toLowerCase();

      let score = 0;

      interests.forEach((interest) => {
        if (interest && text.includes(interest)) {
          score += 5;
        }
      });

      if (
        careerGoal &&
        text.includes(careerGoal)
      ) {
        score += 10;
      }

      return Math.min(score, 20);
    };

    const rankedInternships = internships
      .map((internship) => {
        const match = calculateMatch(
          internship.requiredSkills
        );

        const relevance = keywordScore(
          internship.title,
          internship.description,
          internship.companyName
        );

        return {
          ...internship,
          matchPercentage: Math.min(
            100,
            Math.round(
              match.percentage * 0.8 +
                relevance
            )
          ),
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })
      .sort(
        (a, b) =>
          b.matchPercentage -
          a.matchPercentage
      )
      .slice(0, 10);

    const rankedJobs = jobs
      .map((job) => {
        const match = calculateMatch(
          job.requiredSkills
        );

        const relevance = keywordScore(
          job.title,
          job.description,
          job.companyName
        );

        return {
          ...job,
          matchPercentage: Math.min(
            100,
            Math.round(
              match.percentage * 0.8 +
                relevance
            )
          ),
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })
      .sort(
        (a, b) =>
          b.matchPercentage -
          a.matchPercentage
      )
      .slice(0, 10);

    res.json({
      success: true,
      recommendations: {
        internships: rankedInternships,
        jobs: rankedJobs,
      },
    });
  } catch (error) {
    console.error(
      "Student recommendations error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate recommendations",
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [
      profile,
      assessments,
      internshipApplications,
      jobApplications,
    ] = await Promise.all([
      StudentProfile.findOne({
        user: studentId,
      })
        .populate("user", "name email role")
        .lean(),

      Assessment.find({
        student: studentId,
        status: "completed",
      })
        .sort({ completedAt: -1 })
        .select(
          "skill mode title score bestScore correctAnswers totalQuestions completedAt"
        )
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

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const completedInternships =
      internshipApplications.filter(
        (application) =>
          application.status === "completed"
      );

    const issuedInternshipCertificates =
      completedInternships.filter(
        (application) =>
          application.certificate?.issued === true
      );

    const placementOutcomes =
      jobApplications.filter((application) =>
        ["selected", "offer", "joined"].includes(
          application.status
        )
      );

    const assessmentAverage =
      assessments.length > 0
        ? Math.round(
            assessments.reduce(
              (total, assessment) =>
                total +
                Number(assessment.score || 0),
              0
            ) / assessments.length
          )
        : 0;

    const portfolio = {
      student: {
        name: profile.user?.name || "",
        email: profile.user?.email || "",
      },

      profile: {
        college: profile.college || "",
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

      assessments,

      internships: internshipApplications,

      placements: jobApplications,

      statistics: {
        skills: profile.skills?.length || 0,

        projects: profile.projects?.length || 0,

        certifications:
          (profile.certifications?.length || 0) +
          issuedInternshipCertificates.length,

        assessments: assessments.length,

        assessmentAverage,

        completedInternships:
          completedInternships.length,

        placementOutcomes:
          placementOutcomes.length,

        totalApplications:
          internshipApplications.length +
          jobApplications.length,
      },
    };

    return res.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(
      "Get portfolio error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load student portfolio",
    });
  }
};

const getSkillGapIntelligence = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const [internships, jobs] = await Promise.all([
      Internship.find({
        status: "open",
      })
        .select("requiredSkills")
        .lean(),

      Job.find({
        status: "open",
      })
        .select("requiredSkills")
        .lean(),
    ]);

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

            const key = name.toLowerCase();

            if (!demandMap.has(key)) {
              demandMap.set(key, {
                skill: name,
                demand: 0,
                internships: 0,
                jobs: 0,
              });
            }

            const entry =
              demandMap.get(key);

            entry.demand += 1;

            if (source === "internship") {
              entry.internships += 1;
            }

            if (source === "job") {
              entry.jobs += 1;
            }
          }
        );
      });
    };

    addDemand(
      internships,
      "internship"
    );

    addDemand(
      jobs,
      "job"
    );

    const studentSkills = new Map(
      (profile.skills || [])
        .filter((skill) => skill.name)
        .map((skill) => [
          skill.name.trim().toLowerCase(),
          skill,
        ])
    );

    const comparison = Array.from(
      demandMap.values()
    )
      .sort(
        (a, b) =>
          b.demand - a.demand
      )
      .slice(0, 10)
      .map((item) => {
        const studentSkill =
          studentSkills.get(
            item.skill.toLowerCase()
          );

        return {
          ...item,
          hasSkill:
            Boolean(studentSkill),
          level:
            studentSkill?.level || null,
          score:
            studentSkill?.score || 0,
        };
      });

    const gaps = comparison
      .filter(
        (item) => !item.hasSkill
      )
      .slice(0, 5);

    const matchedSkills =
      comparison.filter(
        (item) => item.hasSkill
      );

    res.json({
      success: true,

      summary: {
        demandedSkills:
          comparison.length,

        matchedSkills:
          matchedSkills.length,

        skillGaps:
          gaps.length,
      },

      comparison,

      gaps,

      matchedSkills,
    });
  } catch (error) {
    console.error(
      "Student skill gap intelligence error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load skill gap intelligence",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getCareerIntelligence,
  getRecommendations,
  getPortfolio,
  getSkillGapIntelligence,
};