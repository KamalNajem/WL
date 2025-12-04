import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Rocket, Target, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-8 max-w-5xl mx-auto">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Master Any Skill with <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Adaptive Learning
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform adapts to your unique learning style, helping you learn faster and retain more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Button size="lg" className="text-lg px-8 h-14" asChild>
            <Link href="/dashboard">
              Get Started <Rocket className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
            <Link href="/quiz">
              Take Style Quiz
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Card className="bg-muted/50 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Personalized Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content that shifts format based on whether you're a visual, auditory, or kinesthetic learner.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Gamified Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Earn XP, unlock badges, and level up as you master new concepts and complete challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                Smart Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your learning velocity and retention rates with detailed insights and recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-sm">
        <p>© 2024 Adaptive Learning Platform. Built with Next.js & Tailwind.</p>
      </footer>
    </div>
  );
}
