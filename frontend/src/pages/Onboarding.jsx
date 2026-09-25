import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper, { Step } from "../components/common/Stepper";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Onboarding.css";

const studentInitial = {
  phone: "",
  college: "",
  degree: "",
  branch: "",
  graduationYear: "",
  bio: "",
  skills: [{ name: "", level: "beginner", score: 0 }],
  interests: [""],
  careerGoal: "",
};

const industryInitial = {
  companyName: "",
  industrySector: "",
  companySize: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  description: "",
  foundedYear: "",
  linkedin: "",
};

const academicianInitial = {
  phone: "",
  institution: "",
  department: "",
  designation: "",
  specialization: "",
  qualifications: [""],
  experienceYears: "",
  bio: "",
  areasOfInterest: [""],
  linkedin: "",
  website: "",
};

const institutionInitial = {
  institutionName: "",
  institutionType: "college",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  description: "",
  establishedYear: "",
  affiliation: "",
  accreditation: [""],
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  textarea = false,
}) {
  return (
    <label className="onboarding-field">
      <span>
        {label}
        {required && <b>*</b>}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="onboarding-field">
      <span>
        {label}
        {required && <b>*</b>}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ArrayInput({
  label,
  values,
  onChange,
  placeholder,
  buttonText = "Add another",
}) {
  const updateValue = (index, value) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const addValue = () => {
    onChange([...values, ""]);
  };

  const removeValue = (index) => {
    if (values.length === 1) return;

    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="onboarding-array">
      <div className="onboarding-array-title">{label}</div>

      {values.map((value, index) => (
        <div className="array-row" key={`${label}-${index}`}>
          <input
            value={value}
            onChange={(event) => updateValue(index, event.target.value)}
            placeholder={placeholder}
          />

          {values.length > 1 && (
            <button
              type="button"
              className="remove-array-button"
              onClick={() => removeValue(index)}
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className="add-array-button"
        onClick={addValue}
      >
        + {buttonText}
      </button>
    </div>
  );
}

function StudentSteps({ data, setData }) {
  const update = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSkill = (index, field, value) => {
    const skills = [...data.skills];
    skills[index] = {
      ...skills[index],
      [field]: value,
    };

    setData((current) => ({
      ...current,
      skills,
    }));
  };

  const addSkill = () => {
    setData((current) => ({
      ...current,
      skills: [
        ...current.skills,
        {
          name: "",
          level: "beginner",
          score: 0,
        },
      ],
    }));
  };

  const removeSkill = (index) => {
    if (data.skills.length === 1) return;

    setData((current) => ({
      ...current,
      skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <>
      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="01 / About"
            title="Tell us about yourself"
            description="Start with a few basic details so Open Collab can build your profile."
          />

          <Field
            label="Phone number"
            value={data.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+91 98765 43210"
          />

          <Field
            label="Short bio"
            value={data.bio}
            onChange={(value) => update("bio", value)}
            placeholder="Tell us a little about yourself..."
            textarea
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="02 / Education"
            title="Your academic journey"
            description="This information helps us understand your academic background."
          />

          <Field
            label="College / University"
            value={data.college}
            onChange={(value) => update("college", value)}
            placeholder="Your college or university"
            required
          />

          <div className="onboarding-grid">
            <Field
              label="Degree"
              value={data.degree}
              onChange={(value) => update("degree", value)}
              placeholder="B.Tech"
              required
            />

            <Field
              label="Branch"
              value={data.branch}
              onChange={(value) => update("branch", value)}
              placeholder="Computer Science"
              required
            />
          </div>

          <Field
            label="Graduation year"
            value={data.graduationYear}
            onChange={(value) => update("graduationYear", value)}
            placeholder="2027"
            type="number"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="03 / Skills"
            title="Show your skills"
            description="Add the technical skills you currently have and your confidence level."
          />

          <div className="skills-list">
            {data.skills.map((skill, index) => (
              <div className="skill-editor" key={`skill-${index}`}>
                <input
                  value={skill.name}
                  onChange={(event) =>
                    updateSkill(index, "name", event.target.value)
                  }
                  placeholder="e.g. React.js"
                />

                <select
                  value={skill.level}
                  onChange={(event) =>
                    updateSkill(index, "level", event.target.value)
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {data.skills.length > 1 && (
                  <button
                    type="button"
                    className="remove-array-button"
                    onClick={() => removeSkill(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="add-array-button"
            onClick={addSkill}
          >
            + Add another skill
          </button>
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="04 / Career"
            title="Where do you want to go?"
            description="Your interests and career goal help Open Collab personalize opportunities."
          />

          <ArrayInput
            label="Areas of interest"
            values={data.interests}
            onChange={(values) => update("interests", values)}
            placeholder="e.g. Artificial Intelligence"
            buttonText="Add another interest"
          />

          <Field
            label="Career goal"
            value={data.careerGoal}
            onChange={(value) => update("careerGoal", value)}
            placeholder="e.g. Become a full-stack developer"
            textarea
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="05 / Review"
            title="Your profile is ready"
            description="Review your information before entering the Open Collab platform."
          />

          <ReviewStudent data={data} />
        </div>
      </Step>
    </>
  );
}

function IndustrySteps({ data, setData }) {
  const update = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="01 / Company"
            title="Tell us about your company"
            description="Create the foundation of your organization's Open Collab profile."
          />

          <Field
            label="Company name"
            value={data.companyName}
            onChange={(value) => update("companyName", value)}
            placeholder="Your company name"
            required
          />

          <Field
            label="Industry sector"
            value={data.industrySector}
            onChange={(value) => update("industrySector", value)}
            placeholder="e.g. Software, FinTech, Healthcare"
          />

          <SelectField
            label="Company size"
            value={data.companySize}
            onChange={(value) => update("companySize", value)}
            options={[
              { value: "", label: "Select company size" },
              { value: "startup", label: "Startup" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "enterprise", label: "Enterprise" },
            ]}
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="02 / Contact"
            title="How can people reach you?"
            description="These details help students and institutions connect with your organization."
          />

          <Field
            label="Phone"
            value={data.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+91 98765 43210"
          />

          <Field
            label="Email"
            value={data.email}
            onChange={(value) => update("email", value)}
            placeholder="company@example.com"
            type="email"
          />

          <Field
            label="Website"
            value={data.website}
            onChange={(value) => update("website", value)}
            placeholder="https://example.com"
          />

          <Field
            label="LinkedIn"
            value={data.linkedin}
            onChange={(value) => update("linkedin", value)}
            placeholder="LinkedIn company URL"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="03 / Location"
            title="Where are you based?"
            description="Add your organization's location."
          />

          <Field
            label="Address"
            value={data.address}
            onChange={(value) => update("address", value)}
            placeholder="Office address"
            textarea
          />

          <div className="onboarding-grid">
            <Field
              label="City"
              value={data.city}
              onChange={(value) => update("city", value)}
              placeholder="Hyderabad"
            />

            <Field
              label="State"
              value={data.state}
              onChange={(value) => update("state", value)}
              placeholder="Telangana"
            />
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="04 / Details"
            title="Your organization"
            description="A little more information helps students understand your company."
          />

          <div className="onboarding-grid">
            <Field
              label="Founded year"
              value={data.foundedYear}
              onChange={(value) => update("foundedYear", value)}
              placeholder="2020"
              type="number"
            />

            <Field
              label="Industry sector"
              value={data.industrySector}
              onChange={(value) => update("industrySector", value)}
              placeholder="Technology"
            />
          </div>

          <Field
            label="Company description"
            value={data.description}
            onChange={(value) => update("description", value)}
            placeholder="Briefly describe your organization..."
            textarea
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="05 / Review"
            title="Company profile ready"
            description="Review your information before entering Open Collab."
          />

          <ReviewIndustry data={data} />
        </div>
      </Step>
    </>
  );
}

function AcademicianSteps({ data, setData }) {
  const update = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="01 / Professional"
            title="Your professional identity"
            description="Tell us about your current academic role."
          />

          <Field
            label="Phone"
            value={data.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+91 98765 43210"
          />

          <Field
            label="Designation"
            value={data.designation}
            onChange={(value) => update("designation", value)}
            placeholder="Assistant Professor"
          />

          <Field
            label="Experience"
            value={data.experienceYears}
            onChange={(value) => update("experienceYears", value)}
            placeholder="5"
            type="number"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="02 / Institution"
            title="Your academic institution"
            description="Connect your profile with your institution and department."
          />

          <Field
            label="Institution"
            value={data.institution}
            onChange={(value) => update("institution", value)}
            placeholder="Institution name"
          />

          <Field
            label="Department"
            value={data.department}
            onChange={(value) => update("department", value)}
            placeholder="Computer Science and Engineering"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="03 / Expertise"
            title="Your academic expertise"
            description="Add your specialization and qualifications."
          />

          <Field
            label="Specialization"
            value={data.specialization}
            onChange={(value) => update("specialization", value)}
            placeholder="Machine Learning"
          />

          <ArrayInput
            label="Qualifications"
            values={data.qualifications}
            onChange={(values) => update("qualifications", values)}
            placeholder="e.g. M.Tech, Ph.D"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="04 / Interests"
            title="Research & interests"
            description="Help us understand the areas where you can collaborate."
          />

          <ArrayInput
            label="Areas of interest"
            values={data.areasOfInterest}
            onChange={(values) => update("areasOfInterest", values)}
            placeholder="e.g. Artificial Intelligence"
          />

          <Field
            label="Professional bio"
            value={data.bio}
            onChange={(value) => update("bio", value)}
            placeholder="Tell us about your academic work..."
            textarea
          />

          <div className="onboarding-grid">
            <Field
              label="LinkedIn"
              value={data.linkedin}
              onChange={(value) => update("linkedin", value)}
              placeholder="LinkedIn URL"
            />

            <Field
              label="Website"
              value={data.website}
              onChange={(value) => update("website", value)}
              placeholder="Website URL"
            />
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="05 / Review"
            title="Academic profile ready"
            description="Review your information before entering Open Collab."
          />

          <ReviewAcademician data={data} />
        </div>
      </Step>
    </>
  );
}

function InstitutionSteps({ data, setData }) {
  const update = (field, value) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="01 / Institution"
            title="Tell us about your institution"
            description="Set up your institution's Open Collab identity."
          />

          <Field
            label="Institution name"
            value={data.institutionName}
            onChange={(value) => update("institutionName", value)}
            placeholder="Institution name"
            required
          />

          <SelectField
            label="Institution type"
            value={data.institutionType}
            onChange={(value) => update("institutionType", value)}
            options={[
              { value: "university", label: "University" },
              { value: "college", label: "College" },
              {
                value: "engineering_college",
                label: "Engineering College",
              },
              { value: "degree_college", label: "Degree College" },
              { value: "polytechnic", label: "Polytechnic" },
              {
                value: "training_institute",
                label: "Training Institute",
              },
              { value: "other", label: "Other" },
            ]}
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="02 / Contact"
            title="Institution contact"
            description="Add the contact details students and industry partners can use."
          />

          <Field
            label="Phone"
            value={data.phone}
            onChange={(value) => update("phone", value)}
            placeholder="+91 98765 43210"
          />

          <Field
            label="Email"
            value={data.email}
            onChange={(value) => update("email", value)}
            placeholder="contact@institution.edu"
            type="email"
          />

          <Field
            label="Website"
            value={data.website}
            onChange={(value) => update("website", value)}
            placeholder="https://institution.edu"
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="03 / Location"
            title="Where is your institution?"
            description="Add your institution's location."
          />

          <Field
            label="Address"
            value={data.address}
            onChange={(value) => update("address", value)}
            placeholder="Institution address"
            textarea
          />

          <div className="onboarding-grid">
            <Field
              label="City"
              value={data.city}
              onChange={(value) => update("city", value)}
              placeholder="Hyderabad"
            />

            <Field
              label="State"
              value={data.state}
              onChange={(value) => update("state", value)}
              placeholder="Telangana"
            />
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="04 / Identity"
            title="Academic identity"
            description="Add information about your institution's academic identity."
          />

          <div className="onboarding-grid">
            <Field
              label="Established year"
              value={data.establishedYear}
              onChange={(value) => update("establishedYear", value)}
              placeholder="1995"
              type="number"
            />

            <Field
              label="Affiliation"
              value={data.affiliation}
              onChange={(value) => update("affiliation", value)}
              placeholder="University / Board"
            />
          </div>

          <ArrayInput
            label="Accreditation"
            values={data.accreditation}
            onChange={(values) => update("accreditation", values)}
            placeholder="e.g. NAAC A+"
          />

          <Field
            label="Description"
            value={data.description}
            onChange={(value) => update("description", value)}
            placeholder="Briefly describe your institution..."
            textarea
          />
        </div>
      </Step>

      <Step>
        <div className="step-content">
          <StepHeader
            eyebrow="05 / Review"
            title="Institution profile ready"
            description="Review your information before entering Open Collab."
          />

          <ReviewInstitution data={data} />
        </div>
      </Step>
    </>
  );
}

function StepHeader({ eyebrow, title, description }) {
  return (
    <div className="step-header">
      <div className="step-eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function ReviewRow({ label, value }) {
  const displayValue =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
      ? "Not provided"
      : Array.isArray(value)
        ? value.filter(Boolean).join(", ")
        : String(value);

  return (
    <div className="review-row">
      <span>{label}</span>
      <strong>{displayValue}</strong>
    </div>
  );
}

function ReviewStudent({ data }) {
  return (
    <div className="review-card">
      <ReviewRow label="College" value={data.college} />
      <ReviewRow label="Degree" value={data.degree} />
      <ReviewRow label="Branch" value={data.branch} />
      <ReviewRow
        label="Graduation year"
        value={data.graduationYear}
      />
      <ReviewRow
        label="Skills"
        value={data.skills
          .filter((skill) => skill.name.trim())
          .map((skill) => `${skill.name} (${skill.level})`)}
      />
      <ReviewRow label="Interests" value={data.interests.filter(Boolean)} />
      <ReviewRow label="Career goal" value={data.careerGoal} />
    </div>
  );
}

function ReviewIndustry({ data }) {
  return (
    <div className="review-card">
      <ReviewRow label="Company" value={data.companyName} />
      <ReviewRow label="Sector" value={data.industrySector} />
      <ReviewRow label="Company size" value={data.companySize} />
      <ReviewRow label="Email" value={data.email} />
      <ReviewRow label="Website" value={data.website} />
      <ReviewRow label="City" value={data.city} />
      <ReviewRow label="State" value={data.state} />
    </div>
  );
}

function ReviewAcademician({ data }) {
  return (
    <div className="review-card">
      <ReviewRow label="Institution" value={data.institution} />
      <ReviewRow label="Department" value={data.department} />
      <ReviewRow label="Designation" value={data.designation} />
      <ReviewRow label="Specialization" value={data.specialization} />
      <ReviewRow
        label="Qualifications"
        value={data.qualifications.filter(Boolean)}
      />
      <ReviewRow
        label="Areas of interest"
        value={data.areasOfInterest.filter(Boolean)}
      />
    </div>
  );
}

function ReviewInstitution({ data }) {
  return (
    <div className="review-card">
      <ReviewRow label="Institution" value={data.institutionName} />
      <ReviewRow label="Type" value={data.institutionType} />
      <ReviewRow label="Email" value={data.email} />
      <ReviewRow label="Website" value={data.website} />
      <ReviewRow label="City" value={data.city} />
      <ReviewRow label="State" value={data.state} />
      <ReviewRow label="Affiliation" value={data.affiliation} />
      <ReviewRow
        label="Accreditation"
        value={data.accreditation.filter(Boolean)}
      />
    </div>
  );
}

function cleanArray(values) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function cleanStudentData(data) {
  return {
    ...data,
    graduationYear: data.graduationYear
      ? Number(data.graduationYear)
      : undefined,
    skills: data.skills
      .filter((skill) => skill.name.trim())
      .map((skill) => ({
        name: skill.name.trim(),
        level: skill.level,
        score: Number(skill.score) || 0,
      })),
    interests: cleanArray(data.interests),
  };
}

function cleanIndustryData(data) {
  return {
    ...data,
    foundedYear: data.foundedYear
      ? Number(data.foundedYear)
      : undefined,
  };
}

function cleanAcademicianData(data) {
  return {
    ...data,
    experienceYears: data.experienceYears
      ? Number(data.experienceYears)
      : undefined,
    qualifications: cleanArray(data.qualifications),
    areasOfInterest: cleanArray(data.areasOfInterest),
  };
}

function cleanInstitutionData(data) {
  return {
    ...data,
    establishedYear: data.establishedYear
      ? Number(data.establishedYear)
      : undefined,
    accreditation: cleanArray(data.accreditation),
  };
}

function Onboarding() {
  const { user, updateUser, getPostAuthPath } = useAuth();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(studentInitial);
  const [industryData, setIndustryData] = useState(industryInitial);
  const [academicianData, setAcademicianData] =
    useState(academicianInitial);
  const [institutionData, setInstitutionData] =
    useState(institutionInitial);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const role = user?.role;

  const roleMeta = useMemo(
    () => ({
      student: {
        title: "Build your student profile",
        subtitle:
          "Tell Open Collab about your skills, education and career goals.",
      },
      industry: {
        title: "Set up your company profile",
        subtitle:
          "Help students discover your organization and opportunities.",
      },
      academician: {
        title: "Build your academic profile",
        subtitle:
          "Show your expertise and areas where you can collaborate.",
      },
      institution: {
        title: "Set up your institution",
        subtitle:
          "Create your institution's identity on Open Collab.",
      },
    }),
    []
  );

  const currentMeta = roleMeta[role] || roleMeta.student;

  const completeOnboarding = async () => {
    setError("");
    setSaving(true);

    try {
      if (role === "student") {
        const payload = cleanStudentData(studentData);

        if (!payload.college || !payload.degree || !payload.branch) {
          throw new Error(
            "Please complete the required education fields before finishing."
          );
        }

        await api.put("/student/profile", payload);
      }

      if (role === "industry") {
        const payload = cleanIndustryData(industryData);

        if (!payload.companyName) {
          throw new Error("Company name is required.");
        }

        await api.put("/industry/profile", payload);
      }

      if (role === "academician") {
        const payload = cleanAcademicianData(academicianData);
        await api.put("/academician/profile", payload);
      }

      if (role === "institution") {
        const payload = cleanInstitutionData(institutionData);

        if (!payload.institutionName) {
          throw new Error("Institution name is required.");
        }

        await api.put("/institution/profile", payload);
      }

      const response = await api.post("/auth/onboarding/complete");

      if (response.data?.user) {
        updateUser(response.data.user);
        navigate(getPostAuthPath(response.data.user), {
          replace: true,
        });
      } else {
        const completedUser = {
          ...user,
          onboardingCompleted: true,
        };

        updateUser(completedUser);
        navigate(getPostAuthPath(completedUser), {
          replace: true,
        });
      }
    } catch (requestError) {
      console.error("Onboarding completion error:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "Unable to complete onboarding. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-orb onboarding-orb-one" />
      <div className="onboarding-orb onboarding-orb-two" />

      <section className="onboarding-shell">
        <div className="onboarding-brand">
          <span className="brand-dot" />
          OPEN COLLAB
        </div>

        <div className="onboarding-heading">
          <div className="onboarding-role">
            {role?.toUpperCase() || "PROFILE"}
          </div>

          <h1>{currentMeta.title}</h1>
          <p>{currentMeta.subtitle}</p>
        </div>

        {error && (
          <div className="onboarding-error" role="alert">
            {error}
          </div>
        )}

        <div className={saving ? "onboarding-stepper saving" : "onboarding-stepper"}>
          <Stepper
            initialStep={1}
            backButtonText="Previous"
            nextButtonText="Continue"
            onFinalStepCompleted={completeOnboarding}
          >
            {role === "student" && (
              <StudentSteps
                data={studentData}
                setData={setStudentData}
              />
            )}

            {role === "industry" && (
              <IndustrySteps
                data={industryData}
                setData={setIndustryData}
              />
            )}

            {role === "academician" && (
              <AcademicianSteps
                data={academicianData}
                setData={setAcademicianData}
              />
            )}

            {role === "institution" && (
              <InstitutionSteps
                data={institutionData}
                setData={setInstitutionData}
              />
            )}
          </Stepper>
        </div>

        {saving && (
          <div className="onboarding-saving">
            Saving your profile and preparing your workspace...
          </div>
        )}
      </section>
    </main>
  );
}

export default Onboarding;