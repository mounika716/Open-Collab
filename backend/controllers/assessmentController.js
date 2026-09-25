const Assessment = require("../models/Assessment");
const StudentProfile = require("../models/StudentProfile");

const {
  getChallenge,
  getRandomChallenge,
} = require("../data/codingChallenges");

const {
  evaluateCode,
} = require("../services/codingEvaluator");

const normalizeSkill = (skill) => {
  const value = skill?.toLowerCase().trim();

  const aliases = {
    js: "javascript",
  };

  return aliases[value] || value;
};

const getSkillLevelFromScore = (score) => {
  if (score >= 80) {
    return "advanced";
  }

  if (score >= 60) {
    return "intermediate";
  }

  return "beginner";
};

const getRemainingSeconds = (assessment) => {
  if (!assessment.startedAt) {
    return assessment.timeLimitSeconds;
  }

  const endTime =
    assessment.startedAt.getTime() +
    assessment.timeLimitSeconds * 1000;

  return Math.max(
    0,
    Math.floor((endTime - Date.now()) / 1000)
  );
};

const updateStudentSkill = async (
  studentId,
  skill,
  score
) => {
  const profile = await StudentProfile.findOne({
    user: studentId,
  });

  if (!profile) {
    return;
  }

  const skillName = skill.trim();

  const existingIndex =
    profile.skills.findIndex(
      (item) =>
        item.name.trim().toLowerCase() ===
        skillName.toLowerCase()
    );

  const level =
    getSkillLevelFromScore(score);

  if (existingIndex >= 0) {
    profile.skills[existingIndex].score =
      score;

    profile.skills[existingIndex].level =
      level;
  } else {
    profile.skills.push({
      name: skillName,
      score,
      level,
    });
  }

  await profile.save();
};

const getAssessmentPayload = (assessment) => ({
  id: assessment._id,
  skill: assessment.skill,
  mode: assessment.mode,
  challengeId: assessment.challengeId,
  language: assessment.language,
  title: assessment.title,
  description: assessment.description,
  starterCode: assessment.starterCode,
  functionName: assessment.functionName,
  timeLimitSeconds:
    assessment.timeLimitSeconds,
  remainingSeconds:
    getRemainingSeconds(assessment),
  status: assessment.status,
  startedAt: assessment.startedAt,
  totalSubmissions:
    assessment.submissions?.length || 0,
  bestScore: assessment.bestScore || 0,
  warningIssued:
    assessment.warningIssued,
  violationCount:
    assessment.violationCount,
  score: assessment.score,
  terminationReason:
    assessment.terminationReason || "",
});

const sanitizeChallenge = (challenge) => ({
  id: challenge.id,
  title: challenge.title,
  difficulty: challenge.difficulty,
  skill: challenge.skill,
  description: challenge.description,
  starterCode: challenge.starterCode,
  functionName: challenge.functionName,
  timeLimitSeconds:
    challenge.timeLimitSeconds,

  visibleTests:
    challenge.visibleTests.map(
      (test, index) => ({
        testNumber: index + 1,
        input: test.input,
        expected: test.expected,
      })
    ),
});

/*
 * --------------------------------------------------
 * TIME LIMIT
 * --------------------------------------------------
 */

const completeBecauseOfTimeout =
  async (assessment) => {
    assessment.score =
      assessment.bestScore || 0;

    assessment.status = "completed";
    assessment.completedAt = new Date();

    await assessment.save();

    await updateStudentSkill(
      assessment.student,
      assessment.skill,
      assessment.score
    );

    return assessment;
  };

/*
 * --------------------------------------------------
 * START CODING ASSESSMENT
 *
 * POST /api/assessment/start
 * --------------------------------------------------
 */

const startAssessment = async (
  req,
  res
) => {
  try {
    const normalizedSkill =
      normalizeSkill(req.body.skill);

    if (!normalizedSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill is required",
      });
    }

    const activeAssessment =
      await Assessment.findOne({
        student: req.user.id,
        status: "in_progress",
      });

    if (activeAssessment) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an assessment in progress",
        assessment:
          getAssessmentPayload(
            activeAssessment
          ),
      });
    }

    const challenge =
      getRandomChallenge(
        normalizedSkill
      );

    /*
     * The current evaluator executes
     * JavaScript challenges.
     */
    if (!challenge) {
  return res.status(400).json({
    success: false,
    message:
      "Coding assessment for this skill is not available yet.",
  });
}

    const assessment =
      await Assessment.create({
        student: req.user.id,
        skill: normalizedSkill,
        mode: "coding",
        challengeId: challenge.id,
        language:
          challenge.skill === "python"
            ? "python"
            : "javascript",
        title: challenge.title,
        description:
          challenge.description,
        starterCode:
          challenge.starterCode,
        functionName:
          challenge.functionName,
        timeLimitSeconds:
          challenge.timeLimitSeconds,
        status: "in_progress",
        startedAt: new Date(),
        bestScore: 0,
        latestCode:
          challenge.starterCode,
      });

    res.status(201).json({
      success: true,
      message:
        "Coding assessment started",
      assessment:
        getAssessmentPayload(
          assessment
        ),
      challenge:
        sanitizeChallenge(challenge),
    });
  } catch (error) {
    console.error(
      "Start coding assessment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to start coding assessment",
    });
  }
};

/*
 * --------------------------------------------------
 * GET ASSESSMENT
 *
 * GET /api/assessment/:id
 * --------------------------------------------------
 */

const getAssessment = async (
  req,
  res
) => {
  try {
    const assessment =
      await Assessment.findOne({
        _id: req.params.id,
        student: req.user.id,
      });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    if (
      assessment.status ===
        "in_progress" &&
      getRemainingSeconds(
        assessment
      ) <= 0
    ) {
      await completeBecauseOfTimeout(
        assessment
      );
    }

    const challenge =
      getChallenge(
        assessment.skill,
        assessment.challengeId
      );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message:
          "Assessment challenge no longer exists",
      });
    }

    res.json({
      success: true,

      assessment:
        getAssessmentPayload(
          assessment
        ),

      challenge:
        sanitizeChallenge(challenge),

      latestCode:
        assessment.latestCode ||
        challenge.starterCode,
    });
  } catch (error) {
    console.error(
      "Get assessment error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get assessment",
    });
  }
};

/*
 * --------------------------------------------------
 * SUBMIT CODE
 *
 * POST /api/assessment/:id/submit
 *
 * Students can submit many times.
 * --------------------------------------------------
 */

const submitCode = async (
  req,
  res
) => {
  try {
    const { code } = req.body;

    if (
      typeof code !== "string" ||
      !code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Code is required",
      });
    }

    if (code.length > 15000) {
      return res.status(400).json({
        success: false,
        message:
          "Code is too large",
      });
    }

    const assessment =
      await Assessment.findOne({
        _id: req.params.id,
        student: req.user.id,
      });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    if (
      assessment.status !==
      "in_progress"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This assessment is no longer active",
        status: assessment.status,
      });
    }

    /*
     * Server-side time enforcement.
     */

    if (
      getRemainingSeconds(
        assessment
      ) <= 0
    ) {
      await completeBecauseOfTimeout(
        assessment
      );

      return res.status(409).json({
        success: false,
        message:
          "Assessment time has expired",
        expired: true,
        score:
          assessment.score,
        status:
          assessment.status,
      });
    }

    const challenge =
      getChallenge(
        assessment.skill,
        assessment.challengeId
      );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message:
          "Challenge not found",
      });
    }

   const evaluation =
  evaluateCode({
    code,
    language:
      assessment.language ||
      "javascript",
    functionName:
      challenge.functionName,
    visibleTests:
      challenge.visibleTests,
    hiddenTests:
      challenge.hiddenTests,
  });

    const previousBest =
      assessment.bestScore || 0;

    const bestScore = Math.max(
      previousBest,
      evaluation.score
    );

    assessment.latestCode = code;
    assessment.bestScore =
      bestScore;

    assessment.submissions.push({
      code,
      score: evaluation.score,
      passedTests:
        evaluation.passedTests,
      totalTests:
        evaluation.totalTests,
      compileError:
        evaluation.compileError || "",
      runtimeError:
        evaluation.runtimeError || "",
      submittedAt: new Date(),
    });

    await assessment.save();

    res.json({
      success: true,
      message:
        evaluation.score >
        previousBest
          ? "New best score recorded"
          : "Submission recorded",

      submission: {
        score:
          evaluation.score,
        passedTests:
          evaluation.passedTests,
        totalTests:
          evaluation.totalTests,
        bestScore,
        totalSubmissions:
          assessment.submissions.length,
        visibleResults:
          evaluation.visibleResults,
        compileError:
          evaluation.compileError || "",
        runtimeError:
          evaluation.runtimeError || "",
      },

      time: {
        remainingSeconds:
          getRemainingSeconds(
            assessment
          ),
      },
    });
  } catch (error) {
    console.error(
      "Code submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to evaluate code",
    });
  }
};

/*
 * --------------------------------------------------
 * FINALIZE ASSESSMENT
 *
 * POST /api/assessment/:id/complete
 * --------------------------------------------------
 */

const finalizeAssessment =
  async (req, res) => {
    try {
      const assessment =
        await Assessment.findOne({
          _id: req.params.id,
          student: req.user.id,
        });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message:
            "Assessment not found",
        });
      }

      if (
        assessment.status ===
        "terminated"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Terminated assessment cannot be completed",
          terminated: true,
        });
      }

      if (
        assessment.status ===
        "completed"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Assessment has already been completed",
        });
      }

      /*
       * If time expired while the
       * student was working, the
       * server completes it using
       * their best submitted score.
       */

      if (
        getRemainingSeconds(
          assessment
        ) <= 0
      ) {
        await completeBecauseOfTimeout(
          assessment
        );
      } else {
        assessment.score =
          assessment.bestScore || 0;

        assessment.status =
          "completed";

        assessment.completedAt =
          new Date();

        await assessment.save();

        await updateStudentSkill(
          assessment.student,
          assessment.skill,
          assessment.score
        );
      }

      res.json({
        success: true,
        message:
          "Coding assessment completed successfully",

        result: {
          assessmentId:
            assessment._id,
          skill:
            assessment.skill,
          score:
            assessment.score,
          bestScore:
            assessment.bestScore,
          submissions:
            assessment.submissions.length,
          status:
            assessment.status,
        },
      });
    } catch (error) {
      console.error(
        "Finalize assessment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to complete assessment",
      });
    }
  };

/*
 * --------------------------------------------------
 * VIOLATION
 *
 * First violation = warning
 * Second violation = termination
 * --------------------------------------------------
 */

const recordViolation = async (
  req,
  res
) => {
  try {
    const {
      type,
      details,
    } = req.body;

    const allowedTypes = [
      "tab_switch",
      "window_blur",
      "fullscreen_exit",
      "copy",
      "cut",
      "paste",
      "right_click",
      "restricted_shortcut",
      "voice_detected",
      "phone_detected",
      "multiple_faces",
      "camera_disabled",
      "microphone_disabled",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid violation type",
      });
    }

    const assessment =
      await Assessment.findOne({
        _id: req.params.id,
        student: req.user.id,
      });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message:
          "Assessment not found",
      });
    }

    if (
      assessment.status ===
      "terminated"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Assessment has already been terminated",
        terminated: true,
      });
    }

    if (
      assessment.status ===
      "completed"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Assessment has already been completed",
      });
    }

    if (
      getRemainingSeconds(
        assessment
      ) <= 0
    ) {
      await completeBecauseOfTimeout(
        assessment
      );

      return res.status(409).json({
        success: false,
        message:
          "Assessment time has expired",
        expired: true,
      });
    }

    assessment.violations.push({
      type,
      details,
      timestamp: new Date(),
    });

    assessment.violationCount += 1;

    if (
      assessment.violationCount === 1
    ) {
      assessment.warningIssued = true;

      await assessment.save();

      return res.json({
        success: true,
        action: "warning",
        warningIssued: true,
        violationCount:
          assessment.violationCount,
        message:
          "Integrity violation detected. This is your final warning. One more confirmed violation will terminate the assessment.",
      });
    }

    assessment.status =
      "terminated";

    assessment.terminatedAt =
      new Date();

    assessment.terminationReason =
      "Second integrity violation";

    await assessment.save();

    return res.json({
      success: true,
      action: "terminate",
      terminated: true,
      violationCount:
        assessment.violationCount,
      message:
        "Assessment terminated because another integrity violation was detected after the warning.",
    });
  } catch (error) {
    console.error(
      "Record violation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to record assessment violation",
    });
  }
};

/*
 * --------------------------------------------------
 * HISTORY
 * --------------------------------------------------
 */

const getAssessmentHistory =
  async (req, res) => {
    try {
      const assessments =
        await Assessment.find({
          student: req.user.id,
        })
          .sort({
            createdAt: -1,
          })
          .select(
            "skill mode challengeId title language status score bestScore submissions violations violationCount warningIssued startedAt completedAt terminatedAt terminationReason createdAt"
          );

      res.json({
        success: true,
        assessments,
      });
    } catch (error) {
      console.error(
        "Assessment history error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get assessment history",
      });
    }
  };

/*
 * --------------------------------------------------
 * LEGACY ANSWER ENDPOINT
 *
 * Kept temporarily so older frontend
 * code gets a clear response rather
 * than breaking the backend.
 * --------------------------------------------------
 */

const submitAnswer = async (
  req,
  res
) => {
  res.status(410).json({
    success: false,
    message:
      "MCQ assessments have been replaced by the coding assessment engine.",
  });
};

module.exports = {
  startAssessment,
  getAssessment,
  submitCode,
  recordViolation,
  finalizeAssessment,
  getAssessmentHistory,
  submitAnswer,

  /*
   * Old name kept as an alias.
   */
  completeAssessment:
    finalizeAssessment,
};