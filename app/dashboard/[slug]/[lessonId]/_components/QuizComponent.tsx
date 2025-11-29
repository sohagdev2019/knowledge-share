"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2, XCircle, Trophy, Coins, Loader2 } from "lucide-react";
import { submitQuiz } from "../actions";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/use-confetti";

interface QuizComponentProps {
  quiz: {
    id: string;
    title: string | null;
    points: number;
    required: boolean;
    questions: {
      id: string;
      question: string;
      options: string[];
      position: number;
    }[];
    submissions?: Array<{
      id: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      pointsEarned: number;
      submittedAt: Date;
    }>;
  };
  slug: string;
  userPoints: number;
  onComplete?: () => void;
}

export function QuizComponent({ quiz, slug, userPoints, onComplete }: QuizComponentProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    pointsEarned: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const { triggerConfetti } = useConfetti();

  const hasSubmission = quiz.submissions && quiz.submissions.length > 0;
  const submission = hasSubmission ? quiz.submissions[0] : null;
  const canRetake = hasSubmission && submission && quiz.required && submission.score < 70;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (isSubmitted || (hasSubmission && !canRetake && !isRetaking)) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    startTransition(async () => {
      const result = await submitQuiz(quiz.id, selectedAnswers, slug);
      if (result.status === "success" && result.data) {
        setSubmissionResult(result.data);
        setIsSubmitted(true);
        setIsRetaking(false); // Reset retaking state after submission
        if (result.data.score >= 70) {
          triggerConfetti();
        }
        const message = isRetaking 
          ? `Quiz retaken! ${result.data.score >= 70 ? "You passed!" : "Your score has been updated."}`
          : `Quiz completed! You earned ${result.data.pointsEarned} points!`;
        toast.success(message);
        onComplete?.();
      } else {
        toast.error(result.message || "Failed to submit quiz");
      }
    });
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const allAnswered = Object.keys(selectedAnswers).length === quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (hasSubmission && submission && !canRetake) {
    const passed = submission.score >= 70;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Card className={passed ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-3 ${passed ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                {passed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-amber-500" />
                )}
              </div>
              <div>
                <CardTitle>Quiz Completed</CardTitle>
                <CardDescription>
                  {passed 
                    ? "You've already completed this quiz"
                    : "You've completed this quiz, but it's optional so you can proceed"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className={`text-2xl font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>
                  {submission.score}%
                </div>
                {!passed && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Need 70%+ to pass
                  </div>
                )}
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Correct</div>
                <div className="text-2xl font-bold text-green-600">
                  {submission.correctAnswers}/{submission.totalQuestions}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Points Earned</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-1">
                  <Coins className="h-5 w-5" />
                  {submission.pointsEarned}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-sm font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show retake option if quiz is required and user didn't pass (but not if currently retaking)
  if (hasSubmission && submission && canRetake && !isRetaking) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-500/20 p-3">
                <XCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle>Quiz Not Passed</CardTitle>
                <CardDescription>
                  You need at least 70% to pass this required quiz. You can retake it to improve your score.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-bold text-amber-600">
                  {submission.score}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Need 70%+ to pass
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Correct</div>
                <div className="text-2xl font-bold text-green-600">
                  {submission.correctAnswers}/{submission.totalQuestions}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Points Earned</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-1">
                  <Coins className="h-5 w-5" />
                  {submission.pointsEarned}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-sm font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                onClick={() => {
                  setIsRetaking(true);
                  setIsSubmitted(false);
                  setSubmissionResult(null);
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isSubmitted && submissionResult) {
    const passed = submissionResult.score >= 70;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6"
      >
        <Card className={passed ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`rounded-full p-3 ${passed ? "bg-green-500/20" : "bg-amber-500/20"}`}
              >
                {passed ? (
                  <Trophy className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-amber-500" />
                )}
              </motion.div>
              <div>
                <CardTitle>{passed ? "Quiz Passed!" : "Quiz Completed"}</CardTitle>
                <CardDescription>
                  {passed
                    ? "Congratulations! You passed the quiz."
                    : "You need at least 70% to pass. You can review the lesson and try again."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-background border"
              >
                <div className="text-sm text-muted-foreground">Score</div>
                <div className={`text-2xl font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>
                  {submissionResult.score}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {passed ? "Passed" : "Failed (Need 70%+)"}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-lg bg-background border"
              >
                <div className="text-sm text-muted-foreground">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600">
                  {submissionResult.correctAnswers}/{submissionResult.totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {submissionResult.totalQuestions - submissionResult.correctAnswers} incorrect
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-lg bg-background border"
              >
                <div className="text-sm text-muted-foreground">Points Earned</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-1">
                  <Coins className="h-5 w-5" />
                  {submissionResult.pointsEarned}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  out of {quiz.points} total
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-lg bg-background border"
              >
                <div className="text-sm text-muted-foreground">Your Total Points</div>
                <div className="text-2xl font-bold text-primary">
                  {userPoints + submissionResult.pointsEarned}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  +{submissionResult.pointsEarned} from quiz
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{quiz.title || "Lesson Quiz"}</CardTitle>
                <CardDescription>
                  {quiz.required
                    ? "Complete this quiz to proceed to the next lesson"
                    : "Test your understanding"}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {quiz.points} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === index;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="size-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {Object.keys(selectedAnswers).length} / {quiz.questions.length} answered
            </div>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || pending}
                className="bg-green-600 hover:bg-green-700"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

