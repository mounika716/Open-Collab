const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Assessment = require("../models/Assessment");
const Internship = require("../models/Internship");
const InternshipApplication = require("../models/InternshipApplication");
const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");

const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      students,
      industries,
      academicians,
      institutions,
      admins,

      totalInternships,
      openInternships,

      totalInternshipApplications,
      pendingInternshipApplications,
      shortlistedInternshipApplications,
      acceptedInternshipApplications,
      rejectedInternshipApplications,
      completedInternships,

      totalJobs,
      openJobs,

      totalJobApplications,
      pendingJobApplications,
      shortlistedJobApplications,
      acceptedJobApplications,
      rejectedJobApplications,

      selectedJobApplications,
      offerJobApplications,
      joinedJobApplications,

      completedAssessments,
      assessmentAverage,

      recentUsers,
      recentInternships,
      recentInternshipApplications,
      recentJobs,
      recentJobApplications,

      studentProfiles,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "industry" }),
      User.countDocuments({ role: "academician" }),
      User.countDocuments({ role: "institution" }),
      User.countDocuments({ role: "admin" }),

      Internship.countDocuments(),

      Internship.countDocuments({
        status: "open",
        applicationDeadline: { $gte: now },
      }),

      InternshipApplication.countDocuments(),

      InternshipApplication.countDocuments({
        status: "pending",
      }),

      InternshipApplication.countDocuments({
        status: "shortlisted",
      }),

      InternshipApplication.countDocuments({
        status: "accepted",
      }),

      InternshipApplication.countDocuments({
        status: "rejected",
      }),

      InternshipApplication.countDocuments({
        status: "completed",
      }),

      Job.countDocuments(),

      Job.countDocuments({
        status: "open",
        applicationDeadline: { $gte: now },
      }),

      JobApplication.countDocuments(),

      JobApplication.countDocuments({
        status: "pending",
      }),

      JobApplication.countDocuments({
        status: "shortlisted",
      }),

      JobApplication.countDocuments({
        status: "accepted",
      }),

      JobApplication.countDocuments({
        status: "rejected",
      }),

      JobApplication.countDocuments({
        status: "selected",
      }),

      JobApplication.countDocuments({
        status: "offer",
      }),

      JobApplication.countDocuments({
        status: "joined",
      }),

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

      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      Internship.find()
        .select(
          "companyName title location type status openings applicationDeadline createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      InternshipApplication.find()
        .populate("student", "name email")
        .populate("internship", "title companyName")
        .select(
          "student internship status matchPercentage appliedAt"
        )
        .sort({ appliedAt: -1 })
        .limit(8)
        .lean(),

      Job.find()
        .select(
          "companyName title location type status openings applicationDeadline createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      JobApplication.find()
        .populate("student", "name email")
        .populate("job", "title companyName")
        .select(
          "student job status matchPercentage appliedAt"
        )
        .sort({ appliedAt: -1 })
        .limit(8)
        .lean(),

      StudentProfile.find()
        .select("skills")
        .lean(),
    ]);

    /*
     * Student skill distribution
     */
    const studentSkillMap = new Map();

    studentProfiles.forEach((profile) => {
      (profile.skills || []).forEach((skill) => {
        const name = skill.name?.trim();

        if (!name) return;

        const key = name.toLowerCase();

        if (!studentSkillMap.has(key)) {
          studentSkillMap.set(key, {
            skill: name,
            students: 0,
            totalScore: 0,
          });
        }

        const entry = studentSkillMap.get(key);

        entry.students += 1;
        entry.totalScore += Number(skill.score || 0);
      });
    });

    const topStudentSkills = Array.from(
      studentSkillMap.values()
    )
      .map((item) => ({
        skill: item.skill,
        students: item.students,
        averageScore:
          item.students > 0
            ? Math.round(
                item.totalScore / item.students
              )
            : 0,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);

    /*
     * Industry skill demand
     */
    const [openInternshipRecords, openJobRecords] =
      await Promise.all([
        Internship.find({
          status: "open",
          applicationDeadline: { $gte: now },
        })
          .select("requiredSkills")
          .lean(),

        Job.find({
          status: "open",
          applicationDeadline: { $gte: now },
        })
          .select("requiredSkills")
          .lean(),
      ]);

    const demandMap = new Map();

    const addDemand = (items, source) => {
      items.forEach((item) => {
        (item.requiredSkills || []).forEach(
          (requiredSkill) => {
            const name = requiredSkill.name?.trim();

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

            const entry = demandMap.get(key);

            entry.demand += 1;

            if (source === "internship") {
              entry.internships += 1;
            } else {
              entry.jobs += 1;
            }
          }
        );
      });
    };

    addDemand(
      openInternshipRecords,
      "internship"
    );

    addDemand(
      openJobRecords,
      "job"
    );

    const industryDemand = Array.from(
      demandMap.values()
    )
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);

    const averageAssessmentScore =
      assessmentAverage.length > 0
        ? Math.round(
            assessmentAverage[0].average || 0
          )
        : 0;

    res.json({
      success: true,

      data: {
        users: {
          total: totalUsers,
          students,
          industries,
          academicians,
          institutions,
          admins,
        },

        internships: {
          total: totalInternships,
          open: openInternships,
        },

        internshipApplications: {
          total: totalInternshipApplications,
          pending:
            pendingInternshipApplications,
          shortlisted:
            shortlistedInternshipApplications,
          accepted:
            acceptedInternshipApplications,
          rejected:
            rejectedInternshipApplications,
          completed:
            completedInternships,
        },

        jobs: {
          total: totalJobs,
          open: openJobs,
        },

        jobApplications: {
          total: totalJobApplications,
          pending: pendingJobApplications,
          shortlisted:
            shortlistedJobApplications,
          accepted: acceptedJobApplications,
          rejected: rejectedJobApplications,
          selected: selectedJobApplications,
          offer: offerJobApplications,
          joined: joinedJobApplications,
        },

        assessments: {
          completed: completedAssessments,
          averageScore:
            averageAssessmentScore,
        },

        studentSkills: {
          totalTrackedSkills:
            studentSkillMap.size,
          topSkills: topStudentSkills,
        },

        industryDemand: {
          openInternships:
            openInternshipRecords.length,
          openJobs:
            openJobRecords.length,
          totalDemandedSkills:
            demandMap.size,
          skills: industryDemand,
        },

        placement: {
          selected: selectedJobApplications,
          offers: offerJobApplications,
          joined: joinedJobApplications,
          completedInternships,
        },

        recentUsers,
        recentInternships,
        recentInternshipApplications,
        recentJobs,
        recentJobApplications,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard",
    });
  }
};

module.exports = {
  getAdminDashboard,
};