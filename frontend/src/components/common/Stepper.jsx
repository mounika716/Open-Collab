import React, { Children, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import './Stepper.css';

const StepperContext = React.createContext(null);

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [totalSteps, setTotalSteps] = useState(0);
  const registeredSteps = useRef(new Map());

  /*
   * Your existing onboarding structure is:
   *
   * <Stepper>
   *   <StudentSteps />
   * </Stepper>
   *
   * StudentSteps then returns five <Step> elements.
   *
   * React cannot inspect the rendered output of a function component
   * with Children.toArray(). Instead, Step components register
   * themselves with this Stepper through context.
   */
  const registerStep = (id) => {
    if (!registeredSteps.current.has(id)) {
      registeredSteps.current.set(id, registeredSteps.current.size + 1);
      setTotalSteps(registeredSteps.current.size);
    }

    return registeredSteps.current.get(id);
  };

  const unregisterStep = (id) => {
    if (registeredSteps.current.delete(id)) {
      const remaining = registeredSteps.current.size;

      if (remaining === 0) {
        setTotalSteps(0);
      }
    }
  };

  const isCompleted = totalSteps > 0 && currentStep > totalSteps;
  const isLastStep = totalSteps > 0 && currentStep === totalSteps;

  const updateStep = (newStep) => {
    setCurrentStep(newStep);

    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    updateStep(totalSteps + 1);
  };

  /*
   * The child itself is rendered inside the context. This allows
   * StudentSteps / IndustrySteps / AcademicianSteps / InstitutionSteps
   * to keep their current implementation unchanged.
   */
  return (
    <StepperContext.Provider
      value={{
        currentStep,
        registerStep,
        unregisterStep
      }}
    >
      <div className="outer-container" {...rest}>
        <div
          className={`step-circle-container ${stepCircleContainerClassName}`}
          style={{ border: '1px solid var(--border-primary, #222)' }}
        >
          {totalSteps > 0 && (
            <div className={`step-indicator-row ${stepContainerClassName}`}>
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isNotLastStep = stepNumber < totalSteps;

                return (
                  <React.Fragment key={stepNumber}>
                    {renderStepIndicator ? (
                      renderStepIndicator({
                        step: stepNumber,
                        currentStep,
                        onStepClick: (clicked) => {
                          updateStep(clicked);
                        }
                      })
                    ) : (
                      <StepIndicator
                        step={stepNumber}
                        disableStepIndicators={disableStepIndicators}
                        currentStep={currentStep}
                        onClickStep={(clicked) => {
                          updateStep(clicked);
                        }}
                      />
                    )}

                    {isNotLastStep && (
                      <StepConnector
                        isComplete={currentStep > stepNumber}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <StepContentWrapper
            isCompleted={isCompleted}
            currentStep={currentStep}
            className={`step-content-default ${contentClassName}`}
          >
            {children}
          </StepContentWrapper>

          {totalSteps > 0 && !isCompleted && (
            <div className={`footer-container ${footerClassName}`}>
              <div
                className={`footer-nav ${
                  currentStep !== 1 ? 'spread' : 'end'
                }`}
              >
                {currentStep !== 1 && (
                  <button
                    onClick={handleBack}
                    className="back-button"
                    {...backButtonProps}
                  >
                    {backButtonText}
                  </button>
                )}

                <button
                  onClick={isLastStep ? handleComplete : handleNext}
                  className="next-button"
                  {...nextButtonProps}
                >
                  {isLastStep ? 'Complete' : nextButtonText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StepperContext.Provider>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  children,
  className
}) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
      animate={{
        height: isCompleted ? 0 : parentHeight
      }}
      transition={{
        type: 'spring',
        duration: 0.4
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        {!isCompleted && (
          <StepVisibility
            currentStep={currentStep}
            onHeightReady={setParentHeight}
          >
            {children}
          </StepVisibility>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StepVisibility({ currentStep, onHeightReady, children }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: '30px' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-30px' }}
      transition={{ duration: 0.35 }}
      style={{
        width: '100%'
      }}
      data-current-step={currentStep}
    >
      {children}
    </motion.div>
  );
}

export function Step({ children }) {
  const context = React.useContext(StepperContext);
  const stepId = React.useId();
  const [stepNumber, setStepNumber] = useState(null);

  useLayoutEffect(() => {
    if (!context) return undefined;

    const number = context.registerStep(stepId);
    setStepNumber(number);

    return () => {
      context.unregisterStep(stepId);
    };
  }, [context, stepId]);

  /*
   * Until registration is complete, render nothing. Once registered,
   * only the current step remains visible. All five existing Step
   * components can therefore stay inside the existing role wrapper.
   */
  if (!context || stepNumber !== context.currentStep) {
    return null;
  }

  return <div className="step-default">{children}</div>;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators
}) {
  const status =
    currentStep === step
      ? 'active'
      : currentStep < step
        ? 'inactive'
        : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="step-indicator"
      style={
        disableStepIndicators
          ? { pointerEvents: 'none', opacity: 0.5 }
          : {}
      }
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: '#222',
            color: '#a3a3a3'
          },
          active: {
            scale: 1,
            backgroundColor: '#5227FF',
            color: '#5227FF'
          },
          complete: {
            scale: 1,
            backgroundColor: '#5227FF',
            color: '#3b82f6'
          }
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? (
          <CheckIcon className="check-icon" />
        ) : status === 'active' ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }) {
  const lineVariants = {
    incomplete: {
      width: 0,
      backgroundColor: 'transparent'
    },
    complete: {
      width: '100%',
      backgroundColor: '#5227FF'
    }
  };

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
