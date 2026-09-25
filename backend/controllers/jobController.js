const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");

const levelRank = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const calculateMatch = (requiredSkills, studentSkills) => {
  if (!requiredSkills?.length) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const studentMap = new Map(
    (studentSkills || []).map((skill) => [
      skill.name.toLowerCase(),
      skill,
    ])
  );

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((required) => {
    const studentSkill = studentMap.get(
      required.name.toLowerCase()
    );

    if (
      studentSkill &&
      (levelRank[studentSkill.level] || 0) >=
        (levelRank[required.minimumLevel] || 0)
    ) {
      matchedSkills.push({
        name: required.name,
        requiredLevel: required.minimumLevel,
        studentLevel: studentSkill.level,
      });
    } else {
      missingSkills.push({
        name: required.name,
        requiredLevel: required.minimumLevel,
      });
    }
  });

  return {
    percentage: Math.round(
      (matchedSkills.length / requiredSkills.length) * 100
    ),
    matchedSkills,
    missingSkills,
  };
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      status: "open",
      applicationDeadline: { $gte: new Date() },
    })
      .populate("industry", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load jobs",
    });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("industry", "name email")
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load job",
    });
  }
};

const createJob = async (req, res) => {
  try {
    const {
      companyName,
      title,
      description,
      location,
      type,
      salary,
      experience,
      requiredSkills,
      applicationDeadline,
      openings,
      status,
    } = req.body;

    if (
      !companyName ||
      !title ||
      !description ||
      !applicationDeadline ||
      !requiredSkills?.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company, title, description, deadline and required skills are required",
      });
    }

    const job = await Job.create({
      industry: req.user.id,
      companyName,
      title,
      description,
      location,
      type,
      salary,
      experience,
      requiredSkills,
      applicationDeadline,
      openings,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      industry: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get my jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load your jobs",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      industry: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      industry: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

const getJobMatch = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).lean();

    const result = calculateMatch(
      job.requiredSkills,
      profile?.skills || []
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Job match error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate job match",
    });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJobMatch,
};