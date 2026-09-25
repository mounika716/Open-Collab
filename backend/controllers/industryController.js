const IndustryProfile = require("../models/IndustryProfile");
const Internship = require("../models/Internship");
const Job = require("../models/Job");
const getProfile = async (req, res) => {
  try {
    let profile = await IndustryProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      profile = await IndustryProfile.create({
        user: req.user.id,
        companyName: req.user.name || "",
        email: req.user.email || "",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get industry profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load industry profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "companyName",
      "industrySector",
      "companySize",
      "phone",
      "email",
      "website",
      "address",
      "city",
      "state",
      "description",
      "foundedYear",
      "linkedin",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const profile = await IndustryProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: updates,
        $setOnInsert: {
          user: req.user.id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Industry profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update industry profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update industry profile",
    });
  }
};
const getIndustryDemand = async (req, res) => {
  try {
    const [internships, jobs] = await Promise.all([
      Internship.find({
        status: "open",
      }).select("requiredSkills"),

      Job.find({
        status: "open",
      }).select("requiredSkills"),
    ]);

    const demandMap = new Map();

    const addSkills = (items, source) => {
      items.forEach((item) => {
        (item.requiredSkills || []).forEach((skill) => {
          const name = skill.name?.trim();

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
        });
      });
    };

    addSkills(internships, "internship");
    addSkills(jobs, "job");

    const skills = Array.from(demandMap.values())
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);

    res.json({
      success: true,
      summary: {
        openInternships: internships.length,
        openJobs: jobs.length,
        totalDemandedSkills: demandMap.size,
      },
      skills,
    });
  } catch (error) {
    console.error(
      "Industry demand intelligence error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load industry demand insights",
    });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getIndustryDemand,
};