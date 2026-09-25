const CODING_CHALLENGES = {
  javascript: [
    {
      id: "js-array-sum-01",
      title: "Fix the Array Sum Function",
      difficulty: "Easy",
      skill: "javascript",
      timeLimitSeconds: 1800,

      description:
        "The function should return the sum of all numbers in the input array. The current implementation contains bugs. Fix the program without changing the function name.",

      starterCode: `function solution(numbers) {
  let total = 1;

  for (let i = 1; i <= numbers.length; i++) {
    total += numbers[i];
  }

  return total;
}`,

      functionName: "solution",

      visibleTests: [
        {
          input: [[1, 2, 3]],
          expected: 6,
        },
        {
          input: [[10, 20, 30, 40]],
          expected: 100,
        },
        {
          input: [[]],
          expected: 0,
        },
      ],

      hiddenTests: [
        {
          input: [[5]],
          expected: 5,
        },
        {
          input: [[-5, 10, -2]],
          expected: 3,
        },
        {
          input: [[100, 200, 300, 400, 500]],
          expected: 1500,
        },
        {
          input: [[0, 0, 0]],
          expected: 0,
        },
        {
          input: [[7, -7]],
          expected: 0,
        },
      ],
    },

    {
      id: "js-string-reverse-01",
      title: "Fix the String Reversal Function",
      difficulty: "Easy",
      skill: "javascript",
      timeLimitSeconds: 1800,

      description:
        "Fix the function so that it returns the input string in reverse order.",

      starterCode: `function solution(text) {
  let result = "";

  for (let i = 0; i < text.length - 1; i++) {
    result += text[i];
  }

  return result;
}`,

      functionName: "solution",

      visibleTests: [
        {
          input: ["hello"],
          expected: "olleh",
        },
        {
          input: ["Open Collab"],
          expected: "balloC nepO",
        },
        {
          input: [""],
          expected: "",
        },
      ],

      hiddenTests: [
        {
          input: ["a"],
          expected: "a",
        },
        {
          input: ["12345"],
          expected: "54321",
        },
        {
          input: ["AYUSH"],
          expected: "HSUYA",
        },
        {
          input: ["hello world"],
          expected: "dlrow olleh",
        },
      ],
    },
  ],

  react: [
  {
    id: "react-profile-map-01",
    title: "Fix the Skill List Renderer",
    difficulty: "Easy",
    skill: "react",
    timeLimitSeconds: 1800,

    description:
      "This function prepares student skills before they are rendered by a React component. It should return an array containing only skill names in uppercase order. The current implementation contains bugs. Fix the function without changing its name.",

    starterCode: `function solution(skills) {
  const result = [];

  for (let i = 1; i <= skills.length; i++) {
    result.push(skills[i].name);
  }

  return result;
}`,

    functionName: "solution",

    visibleTests: [
      {
        input: [
          [
            { name: "React" },
            { name: "JavaScript" },
          ],
        ],
        expected: [
          "REACT",
          "JAVASCRIPT",
        ],
      },
      {
        input: [
          [
            { name: "Python" },
            { name: "SQL" },
            { name: "MongoDB" },
          ],
        ],
        expected: [
          "PYTHON",
          "SQL",
          "MONGODB",
        ],
      },
      {
        input: [[]],
        expected: [],
      },
    ],

    hiddenTests: [
      {
        input: [
          [
            { name: "HTML" },
          ],
        ],
        expected: ["HTML"],
      },
      {
        input: [
          [
            { name: "Node.js" },
            { name: "Express" },
            { name: "React" },
          ],
        ],
        expected: [
          "NODE.JS",
          "EXPRESS",
          "REACT",
        ],
      },
      {
        input: [
          [
            { name: "ayush" },
            { name: "research" },
          ],
        ],
        expected: [
          "AYUSH",
          "RESEARCH",
        ],
      },
    ],
  },
],

  python: [
    {
      id: "python-array-max-01",
      title: "Fix the Maximum Finder",
      difficulty: "Easy",
      skill: "python",
      timeLimitSeconds: 1800,

      description:
        "Fix the function so that it returns the largest number in the given list.",

      starterCode: `def solution(numbers):
    maximum = 0

    for number in numbers:
        if number < maximum:
            maximum = number

    return maximum`,

      functionName: "solution",

      visibleTests: [
        {
          input: [[1, 5, 3]],
          expected: 5,
        },
        {
          input: [[10, 2, 8]],
          expected: 10,
        },
      ],

      hiddenTests: [
        {
          input: [[-5, -2, -9]],
          expected: -2,
        },
        {
          input: [[100]],
          expected: 100,
        },
        {
          input: [[4, 4, 4]],
          expected: 4,
        },
      ],
    },
  ],
};

const getChallengesForSkill = (skill) => {
  const normalized = skill?.toLowerCase().trim();

  return CODING_CHALLENGES[normalized] || [];
};

const getChallenge = (skill, challengeId) => {
  const challenges = getChallengesForSkill(skill);

  return (
    challenges.find(
      (challenge) => challenge.id === challengeId
    ) || null
  );
};

const getRandomChallenge = (skill) => {
  const challenges = getChallengesForSkill(skill);

  if (!challenges.length) {
    return null;
  }

  return challenges[
    Math.floor(Math.random() * challenges.length)
  ];
};

module.exports = {
  CODING_CHALLENGES,
  getChallengesForSkill,
  getChallenge,
  getRandomChallenge,
};