'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

const questions = [
    {
        id: 1,
        text: "When you are learning a new game, do you prefer to:",
        options: [
            { key: 'A', text: "Look at the diagrams and pictures in the instructions" },
            { key: 'B', text: "Listen to others explain the rules" },
            { key: 'C', text: "Read the instructions from start to finish" },
            { key: 'D', text: "Start playing and learn as you go" }
        ]
    },
    {
        id: 2,
        text: "When you are not sure how to spell a word, do you:",
        options: [
            { key: 'A', text: "Picture the word in your mind" },
            { key: 'B', text: "Sound it out" },
            { key: 'C', text: "Look it up in a dictionary" },
            { key: 'D', text: "Write it down to see if it looks right" }
        ]
    },
    {
        id: 3,
        text: "You want to plan a surprise party for a friend. Do you:",
        options: [
            { key: 'A', text: "Draw a map or diagram of the venue" },
            { key: 'B', text: "Talk it over with other friends" },
            { key: 'C', text: "Make a list of what needs to be done" },
            { key: 'D', text: "Invite friends and just let it happen" }
        ]
    },
    {
        id: 4,
        text: "You are about to buy a new digital camera or mobile phone. Other than price, what would most influence your decision?",
        options: [
            { key: 'A', text: "It looks modern and cool" },
            { key: 'B', text: "The salesperson selling it to you" },
            { key: 'C', text: "Reading the details about its features" },
            { key: 'D', text: "Trying it out and testing it" }
        ]
    },
    {
        id: 5,
        text: "Remember a time when you learned how to do something new. Try to avoid choosing a physical skill, eg. riding a bike. You learned best by:",
        options: [
            { key: 'A', text: "Seeing diagrams and charts" },
            { key: 'B', text: "Listening to explanations or asking questions" },
            { key: 'C', text: "Reading written instructions" },
            { key: 'D', text: "Watching a demonstration" }
        ]
    },
    {
        id: 6,
        text: "You have a problem with your heart. You would prefer that the doctor:",
        options: [
            { key: 'A', text: "Showed you a diagram of what was wrong" },
            { key: 'B', text: "Described what was wrong" },
            { key: 'C', text: "Gave you a pamphlet or article to read about it" },
            { key: 'D', text: "Used a plastic model to show what was wrong" }
        ]
    },
    {
        id: 7,
        text: "You want to learn a new program, skill or game on a computer. You would:",
        options: [
            { key: 'A', text: "Follow the diagrams in the book" },
            { key: 'B', text: "Talk with people who know about the program" },
            { key: 'C', text: "Read the written instructions that came with the program" },
            { key: 'D', text: "Start using the keyboard and learn by trial and error" }
        ]
    },
    {
        id: 8,
        text: "You are helping someone who wants to go to your airport, the town centre or railway station. You would:",
        options: [
            { key: 'A', text: "Draw, or give her a map" },
            { key: 'B', text: "Tell her the directions" },
            { key: 'C', text: "Write down the directions (without a map)" },
            { key: 'D', text: "Go with her" }
        ]
    },
    {
        id: 9,
        text: "You are planning a holiday for a group. You want some feedback on the plan. You would:",
        options: [
            { key: 'A', text: "Show them some photos of where you will go" },
            { key: 'B', text: "Discuss the plan with the group" },
            { key: 'C', text: "Give them a copy of the printed itinerary" },
            { key: 'D', text: "Describe some of the highlights they will experience" }
        ]
    },
    {
        id: 10,
        text: "You are going to cook something as a special treat for your family. You would:",
        options: [
            { key: 'A', text: "Look through the cookbook for pictures" },
            { key: 'B', text: "Ask friends for suggestions" },
            { key: 'C', text: "Use a cookbook where you know there is a good recipe" },
            { key: 'D', text: "Cook something you know without the need for instructions" }
        ]
    },
    {
        id: 11,
        text: "A group of tourists want to learn about the parks or wildlife reserves in your area. You would:",
        options: [
            { key: 'A', text: "Show them maps and internet pictures" },
            { key: 'B', text: "Talk about, or arrange a talk for them about parks or wildlife reserves" },
            { key: 'C', text: "Give them a book or pamphlets about the parks or wildlife reserves" },
            { key: 'D', text: "Take them to a park or wildlife reserve and walk with them" }
        ]
    },
    {
        id: 12,
        text: "You are about to purchase a new stereo or audio components. Other than price, what would most influence your decision?",
        options: [
            { key: 'A', text: "It looks modern and cool" },
            { key: 'B', text: "The salesperson telling you what you want to know" },
            { key: 'C', text: "Reading the details about its features" },
            { key: 'D', text: "Listening to it" }
        ]
    },
    {
        id: 13,
        text: "You prefer a teacher or a presenter who uses:",
        options: [
            { key: 'A', text: "Diagrams, charts or graphs" },
            { key: 'B', text: "Question and answer, talk, group discussion, or guest speakers" },
            { key: 'C', text: "Handouts, books, or readings" },
            { key: 'D', text: "Demonstrations, models or practical sessions" }
        ]
    },
    {
        id: 14,
        text: "You have finished a competition or test and would like some feedback. You would like to have feedback:",
        options: [
            { key: 'A', text: "Using graphs showing what you had achieved" },
            { key: 'B', text: "From somebody who talks it through with you" },
            { key: 'C', text: "Using a written description of your results" },
            { key: 'D', text: "Using examples from what you have done" }
        ]
    },
    {
        id: 15,
        text: "You are not sure whether a word should be spelled 'dependent' or 'dependant'. You would:",
        options: [
            { key: 'A', text: "See the words in your mind and choose by the way they look" },
            { key: 'B', text: "Sound it out in your mind" },
            { key: 'C', text: "Look it up in the dictionary" },
            { key: 'D', text: "Write both words on paper and choose one" }
        ]
    }
];

export default function QuizPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleOptionSelect = (optionKey: string) => {
        setAnswers({ ...answers, [questions[currentStep].id]: optionKey });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitQuiz();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submitQuiz = async () => {
        setLoading(true);
        try {
            const response = await api.post('adaptation/submit-quiz/', { answers });
            setResult(response.data.style);
        } catch (error) {
            console.error('Quiz submission failed:', error);
            alert('Failed to submit quiz.');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mb-6 text-6xl animate-bounce">🎉</div>
                        <CardTitle className="text-3xl font-bold mb-4">
                            Result: <span className="text-primary">{result}</span> Learner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-8">
                            We have updated your profile. Your course content will now be adapted to your {result} learning style.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={() => router.push('/dashboard')}
                            className="w-full"
                            size="lg"
                        >
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const question = questions[currentStep];
    const isLastQuestion = currentStep === questions.length - 1;
    const canProceed = !!answers[question.id];
    const progressValue = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-border bg-card/50 backdrop-blur-sm shadow-xl">
                {/* Progress Bar */}
                <div className="px-6 pt-6">
                    <Progress value={progressValue} className="h-2" />
                </div>

                <CardHeader className="p-8 md:p-12 pb-4">
                    <div className="mb-4">
                        <span className="text-sm font-bold text-primary tracking-wider uppercase">
                            Question {currentStep + 1} of {questions.length}
                        </span>
                        <CardTitle className="text-2xl md:text-3xl font-bold mt-2 leading-tight">
                            {question.text}
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="p-8 md:p-12 pt-0 space-y-4">
                    {question.options.map((option) => {
                        const isSelected = answers[question.id] === option.key;
                        return (
                            <div
                                key={option.key}
                                onClick={() => handleOptionSelect(option.key)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer hover:bg-accent/50",
                                    isSelected 
                                        ? "border-primary bg-primary/10" 
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold border transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground border-border"
                                )}>
                                    {isSelected ? <CheckCircle2 className="h-5 w-5" /> : option.key}
                                </div>
                                <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>
                                    {option.text}
                                </span>
                            </div>
                        );
                    })}
                </CardContent>

                <CardFooter className="p-8 md:p-12 pt-0 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>
                    
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed || loading}
                        className={cn("min-w-[140px]", !canProceed && "opacity-50")}
                    >
                        {loading ? 'Calculating...' : isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
