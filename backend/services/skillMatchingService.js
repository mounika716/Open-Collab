const LEVEL_RANK = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const LEVEL_TARGET_SCORE = {
  beginner: 40,
  intermediate: 60,
  advanced: 80,
};

const normalizeSkill = (skill) => {
  const value = String(skill || "")
    .trim()
    .toLowerCase();

  const aliases = {
    js: "javascript",
    node: "node.js",
    nodejs: "node.js",
    reactjs: "react",
    mongo: "mongodb",
    ml: "machine learning",
    ai: "artificial intelligence",
  };

  return aliases[value] || value;
};

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const getLevelRank = (level) =>
  LEVEL_RANK[String(level || "").toLowerCase()] || 1;

const getLevelTargetScore = (level) =>
  LEVEL_TARGET_SCORE[
    String(level || "").toLowerCase()
  ] || 40;

const calculateSkillCompatibility = (
  studentSkill,
  requiredSkill
) => {
  const requiredLevel =
    String(requiredSkill.minimumLevel || "beginner")
      .toLowerCase();

  const requiredTarget =
    getLevelTargetScore(requiredLevel);

  if (!studentSkill) {
    return {
      skill: requiredSkill.name,
      requiredLevel,
      studentLevel: null,
      studentScore: 0,
      levelMatched: false,
      scoreCompatibility: 0,
      compatibility: 0,
      matched: false,
      status: "gap",
    };
  }

  const studentScore = clamp(
    Number(studentSkill.score) || 0
  );

  const studentLevel =
    String(studentSkill.level || "beginner")
      .toLowerCase();

  const levelMatched =
    getLevelRank(studentLevel) >=
    getLevelRank(requiredLevel);

  /*
   * Score compatibility measures how close the
   * student's actual score is to the expected score
   * for the required level.
   */
  const scoreRatio =
    studentScore / requiredTarget;

  const scoreCompatibility = clamp(
    Math.round(scoreRatio * 100)
  );

  /*
   * The score is the primary signal.
   *
   * Level compatibility provides a smaller bonus,
   * but only when the actual score reaches the
   * required threshold.
   */
  const compatibility = Math.round(
    scoreCompatibility * 0.7 +
      (levelMatched && studentScore >= requiredTarget
        ? 30
        : 0)
  );

  let status = "gap";

  if (compatibility >= 80) {
    status = "strong";
  } else if (compatibility >= 60) {
    status = "developing";
  }

  return {
    skill: requiredSkill.name,
    requiredLevel,
    studentLevel,
    studentScore,
    levelMatched,
    scoreCompatibility,
    compatibility,
    matched: compatibility >= 60,
    status,
  };
};

const calculateSkillMatch = (
  studentSkills = [],
  requiredSkills = []
) => {
  if (!requiredSkills.length) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
      skillResults: [],
    };
  }

  const studentSkillMap = new Map();

  for (const skill of studentSkills) {
    const normalizedName = normalizeSkill(
      skill?.name
    );

    if (!normalizedName) continue;

    const existing =
      studentSkillMap.get(normalizedName);

    if (
      !existing ||
      Number(skill.score || 0) >
        Number(existing.score || 0)
    ) {
      studentSkillMap.set(
        normalizedName,
        skill
      );
    }
  }

  const skillResults = requiredSkills.map(
    (requiredSkill) => {
      const studentSkill =
        studentSkillMap.get(
          normalizeSkill(requiredSkill.name)
        );

      return calculateSkillCompatibility(
        studentSkill,
        requiredSkill
      );
    }
  );

  const percentage = Math.round(
    skillResults.reduce(
      (total, item) =>
        total + item.compatibility,
      0
    ) / skillResults.length
  );

  const matchedSkills =
    skillResults.filter(
      (item) => item.matched
    );

  const missingSkills =
    skillResults.filter(
      (item) => !item.matched
    );

  return {
    percentage,
    matchedSkills,
    missingSkills,
    skillResults,
  };
};

module.exports = {
  normalizeSkill,
  getLevelRank,
  calculateSkillCompatibility,
  calculateSkillMatch,
};
