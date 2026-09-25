/* eslint-disable react-hooks/immutability */
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Code2,
  Lock,
  Monitor,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Video,
  VideoOff,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  startAssessment,
  getAssessment,
  submitCode,
  recordViolation,
  completeAssessment,
  getAssessmentHistory,
} from "../services/assessmentApi";

import "./StudentAssessment.css";

function StudentAssessment() {
  const navigate = useNavigate();
  const { skill } = useParams();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const violationLockRef = useRef(false);

  const [assessment, setAssessment] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [warning, setWarning] = useState("");
  const [terminated, setTerminated] = useState(false);
  const [result, setResult] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /*
   * --------------------------------------------------
   * INITIALIZE
   * --------------------------------------------------
   */

  useEffect(() => {
    initializeAssessment();

    return () => {
      stopCamera();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const initializeAssessment = async () => {
    try {
      setLoading(true);
      setStarting(true);
      setError("");

      const savedId = localStorage.getItem("openCollabAssessmentId");

      if (savedId) {
        try {
          const data = await getAssessment(savedId);

          if (data.assessment?.status === "in_progress") {
            setAssessment(data.assessment);
            setChallenge(data.challenge);
            setCode(
              data.latestCode ||
                data.challenge?.starterCode ||
                ""
            );
            setTimeLeft(data.assessment?.remainingSeconds || 0);

            setLoading(false);
            setStarting(false);

            await startMonitoring();
            return;
          }

          localStorage.removeItem("openCollabAssessmentId");
        } catch {
          localStorage.removeItem("openCollabAssessmentId");
        }
      }

      const data = await startAssessment(skill);

      setAssessment(data.assessment);
      setChallenge(data.challenge);
      setCode(data.challenge?.starterCode || "");
      setTimeLeft(
        data.assessment?.remainingSeconds ||
          data.assessment?.timeLimitSeconds ||
          0
      );

      localStorage.setItem(
        "openCollabAssessmentId",
        data.assessment.id
      );

      setLoading(false);
      setStarting(false);

      await startMonitoring();
    } catch (err) {
      /*
       * Recover an already active assessment when possible.
       */
      try {
        const history = await getAssessmentHistory();

        const active = history.assessments?.find(
          (item) =>
            item.status === "in_progress" &&
            item.skill === skill.toLowerCase()
        );

        if (active) {
          const data = await getAssessment(active._id);

          setAssessment(data.assessment);
          setChallenge(data.challenge);
          setCode(
            data.latestCode ||
              data.challenge?.starterCode ||
              ""
          );
          setTimeLeft(data.assessment?.remainingSeconds || 0);

          localStorage.setItem(
            "openCollabAssessmentId",
            active._id
          );

          setLoading(false);
          setStarting(false);

          await startMonitoring();
          return;
        }
      } catch {
        // Continue to normal error handling.
      }

      setError(
        err.response?.data?.message ||
          "Unable to start coding assessment"
      );

      setLoading(false);
      setStarting(false);
    }
  };

  /*
   * --------------------------------------------------
   * CAMERA
   * --------------------------------------------------
   */

  const startMonitoring = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is unavailable");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);

      await enterFullscreen();
    } catch (err) {
      console.error("Monitoring startup:", err);

      setError(
        "Camera and microphone access is required for the monitored assessment."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
  };

  /*
   * --------------------------------------------------
   * FULLSCREEN
   * --------------------------------------------------
   */

  const enterFullscreen = async () => {
    try {
      if (
        !document.fullscreenElement &&
        document.documentElement.requestFullscreen
      ) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }
  };

  /*
   * --------------------------------------------------
   * TIMER
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      !assessment ||
      assessment.status !== "in_progress" ||
      timeLeft <= 0
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timerRef.current);
          finishAssessment(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [assessment]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  /*
   * --------------------------------------------------
   * INTEGRITY
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!assessment) {
      return;
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        handleViolation("tab_switch", "Assessment tab became hidden.");
      }
    };

    const handleBlur = () => {
      handleViolation("window_blur", "Assessment window lost focus.");
    };

    const handleFullscreen = () => {
      if (
        !document.fullscreenElement &&
        assessment.status === "in_progress"
      ) {
        handleViolation(
          "fullscreen_exit",
          "Fullscreen mode was exited."
        );
      }
    };

    const handleCopy = (event) => {
      event.preventDefault();
      handleViolation("copy", "Copy action attempted.");
    };

    const handleCut = (event) => {
      event.preventDefault();
      handleViolation("cut", "Cut action attempted.");
    };

    const handlePaste = (event) => {
      event.preventDefault();
      handleViolation("paste", "Paste action attempted.");
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      handleViolation("right_click", "Right click attempted.");
    };

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (
        (event.ctrlKey || event.metaKey) &&
        ["c", "v", "x"].includes(key)
      ) {
        event.preventDefault();
        handleViolation(
          key === "c" ? "copy" : key === "v" ? "paste" : "cut",
          "Restricted keyboard shortcut attempted."
        );
        return;
      }

      if (
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j"].includes(key))
      ) {
        event.preventDefault();
        handleViolation(
          "restricted_shortcut",
          "Developer tools shortcut attempted."
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assessment]);

  const handleViolation = async (type, details) => {
    if (!assessment || assessment.status !== "in_progress") {
      return;
    }

    if (violationLockRef.current) {
      return;
    }

    violationLockRef.current = true;

    setTimeout(() => {
      violationLockRef.current = false;
    }, 1500);

    try {
      const data = await recordViolation(
        assessment.id,
        type,
        details
      );

      if (data.action === "warning") {
        setWarning(
          "FINAL WARNING â€” One more confirmed integrity violation will terminate this assessment."
        );

        setAssessment((current) => ({
          ...current,
          warningIssued: true,
          violationCount: data.violationCount,
        }));

        setTimeout(() => {
          setWarning("");
        }, 5000);
      }

      if (data.action === "terminate" || data.terminated) {
        setTerminated(true);
        stopCamera();

        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {
            // Ignore exit errors.
          }
        }
      }
    } catch (err) {
      console.error("Violation recording failed:", err);
    }
  };

  /*
   * --------------------------------------------------
   * CODE EDITOR
   * --------------------------------------------------
   */

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    setNotice("");
    setError("");
  };

  /*
   * --------------------------------------------------
   * SUBMIT CODE
   * --------------------------------------------------
   */

  const handleSubmitCode = async () => {
    if (
      !assessment ||
      submitting ||
      finishing ||
      terminated ||
      !code.trim()
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const data = await submitCode(assessment.id, code);

      setLastSubmission(data.submission);

      setAssessment((current) => ({
        ...current,
        bestScore: data.submission.bestScore,
        totalSubmissions: data.submission.totalSubmissions,
      }));

      setNotice(data.message || "Submission recorded.");
    } catch (err) {
      if (err.response?.data?.expired) {
        setTimeLeft(0);
        await finishAssessment(true);
        return;
      }

      setError(
        err.response?.data?.message || "Unable to evaluate code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------
   * FINALIZE ASSESSMENT
   * --------------------------------------------------
   */

  const finishAssessment = async (autoSubmitted = false) => {
    if (!assessment || finishing) return;

    try {
      setFinishing(true);
      setError("");

      const data = await completeAssessment(assessment.id, {
        autoSubmitted,
      });

      setResult(data);
      localStorage.removeItem("openCollabAssessmentId");

      stopCamera();

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore exit errors.
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to finalize assessment. Please try again."
      );
    } finally {
      setFinishing(false);
    }
  };

  const handleResetCode = () => {
    if (challenge?.starterCode) {
      setCode(challenge.starterCode);
      setNotice("Code reset to starter template.");
      setError("");
    }
  };

  /*
   * --------------------------------------------------
   * RENDER UI: LOADING / INITIALIZING
   * --------------------------------------------------
   */

  if (loading || starting) {
    return (
      <div className="assessment-container loading-state">
        <div className="assessment-card text-center">
          <ShieldCheck className="icon-pulse mx-auto mb-4" size={48} />
          <h2>Preparing Monitored Assessment</h2>
          <p className="text-muted">
            Initializing integrity system, camera stream, and skill challenge...
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * RENDER UI: TERMINATED OR COMPLETED RESULT
   * --------------------------------------------------
   */

  if (terminated) {
    return (
      <div className="assessment-container terminated-state">
        <div className="assessment-card border-danger">
          <AlertTriangle className="text-danger mb-3" size={56} />
          <h2>Assessment Terminated</h2>
          <p className="lead">
            Multiple integrity violations were detected during this session.
          </p>
          <div className="alert-box alert-danger mt-4">
            <Lock className="inline-icon mr-2" size={18} />
            This session has been permanently locked and flagged for review.
          </div>
          <button
            className="btn btn-secondary mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const isPassed = result.status === "passed" || result.score >= 70;

    return (
      <div className="assessment-container result-state">
        <div className="assessment-card text-center">
          <div className={`status-badge ${isPassed ? "success" : "failed"}`}>
            {isPassed ? <Check size={40} /> : <AlertTriangle size={40} />}
          </div>
          <h2>{isPassed ? "Assessment Passed!" : "Assessment Complete"}</h2>
          <p className="text-muted mb-4">Skill Target: {skill?.toUpperCase()}</p>

          <div className="score-summary-grid">
            <div className="score-box">
              <span className="score-label">Final Score</span>
              <span className="score-value">{result.score || 0}%</span>
            </div>
            <div className="score-box">
              <span className="score-label">Submissions</span>
              <span className="score-value">{result.totalSubmissions || 0}</span>
            </div>
            <div className="score-box">
              <span className="score-label">Status</span>
              <span className="score-value text-capitalize">{result.status}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * RENDER UI: ACTIVE ASSESSMENT WORKSPACE
   * --------------------------------------------------
   */

  const lineCount = code.split("\n").length;

  return (
    <div className="assessment-workspace">
      {/* HEADER BAR */}
      <header className="workspace-header">
        <div className="header-brand">
          <Code2 className="brand-icon" size={24} />
          <span className="brand-title">{skill?.toUpperCase()} Skill Assessment</span>
        </div>

        <div className="header-status">
          <div className={`timer-pill ${timeLeft < 300 ? "urgent" : ""}`}>
            <Clock3 size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div className={`camera-pill ${cameraActive ? "active" : "inactive"}`}>
            {cameraActive ? <Video size={16} /> : <VideoOff size={16} />}
            <span>{cameraActive ? "Monitored" : "Camera Off"}</span>
          </div>

          <button
            className="btn btn-success btn-sm"
            onClick={() => finishAssessment(false)}
            disabled={finishing || submitting}
          >
            <Send size={14} className="mr-1" />
            {finishing ? "Finalizing..." : "Finish Assessment"}
          </button>
        </div>
      </header>

      {/* WARNING BANNER */}
      {warning && (
        <div className="integrity-warning-banner">
          <AlertTriangle size={18} />
          <span>{warning}</span>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="workspace-main">
        {/* LEFT PANEL: CHALLENGE DETAILS & FEEDBACK */}
        <section className="panel challenge-panel">
          <div className="panel-header">
            <h3>{challenge?.title || "Coding Challenge"}</h3>
            <span className="badge badge-outline">{challenge?.difficulty || "Medium"}</span>
          </div>

          <div className="panel-body scrollable">
            <div className="markdown-content">
              <p>{challenge?.description}</p>

              {challenge?.instructions && (
                <>
                  <h4>Instructions</h4>
                  <p>{challenge.instructions}</p>
                </>
              )}

              {challenge?.examples?.length > 0 && (
                <div className="examples-section">
                  <h4>Examples</h4>
                  {challenge.examples.map((ex, idx) => (
                    <div key={idx} className="example-block">
                      <div><strong>Input:</strong> <code>{ex.input}</code></div>
                      <div><strong>Output:</strong> <code>{ex.output}</code></div>
                      {ex.explanation && <div><small>{ex.explanation}</small></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FEEDBACK & OUTPUT MESSAGES */}
            {error && (
              <div className="alert-box alert-danger mt-3">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="alert-box alert-info mt-3">
                <Check size={16} />
                <span>{notice}</span>
              </div>
            )}

            {lastSubmission && (
              <div className="submission-result-box mt-3">
                <h4>Latest Evaluation</h4>
                <div className="result-row">
                  <span>Score:</span>
                  <strong>{lastSubmission.score}%</strong>
                </div>
                {lastSubmission.feedback && (
                  <p className="feedback-text mt-2">{lastSubmission.feedback}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CENTER PANEL: CODE EDITOR */}
        <section className="panel editor-panel">
          <div className="panel-header">
            <span>Solution Editor</span>
            <div className="editor-actions">
              <button
                className="btn btn-icon"
                onClick={handleResetCode}
                title="Reset Starter Code"
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmitCode}
                disabled={submitting || finishing || !code.trim()}
              >
                <Play size={14} className="mr-1" />
                {submitting ? "Evaluating..." : "Run & Submit"}
              </button>
            </div>
          </div>

          <div className="editor-container">
            <div className="editor-gutter">
              {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                <div key={i + 1} className="line-number">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={handleCodeChange}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Write your code solution here..."
            />
          </div>
        </section>

        {/* RIGHT PANEL: WEBCAM MONITORING */}
        <aside className="panel monitoring-panel">
          <div className="panel-header">
            <span>Proctoring Feed</span>
          </div>

          <div className="webcam-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="webcam-feed"
            />
            {!cameraActive && (
              <div className="webcam-placeholder">
                <VideoOff size={24} />
                <span>Camera Offline</span>
              </div>
            )}
          </div>

          <div className="monitor-note">
            <Monitor size={14} />
            <span>Stay inside the assessment environment until you finish.</span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default StudentAssessment;
