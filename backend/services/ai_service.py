import os
import json
from pydantic import BaseModel, Field
from typing import List, Optional

# Structured output schema for AI Generation
class MilestoneSchema(BaseModel):
    skill_name: str
    description: str
    difficulty: str
    estimated_time: str

class PhaseSchema(BaseModel):
    phase_name: str
    milestones: List[MilestoneSchema]

class CareerRoadmapSchema(BaseModel):
    career_goal: str
    recommended_domain: str
    estimated_focus: str
    explanation: str
    phases: List[PhaseSchema]

class AIService:
    """
    Abstracted AI Service layer to decouple the application from a specific LLM provider.
    Currently configured to return a robust mocked response if the API key is absent,
    providing a safe fallback.
    """
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        # Initialize your actual AI client here when configured.
    
    async def generate_career_roadmap(self, profile_data: dict) -> CareerRoadmapSchema:
        """
        Generates a structured career roadmap using the provided profile data.
        Returns validated Pydantic model.
        """
        # If no API key, return a reliable mock structured response.
        # This prevents the app from breaking when no AI is configured.
        if not self.api_key:
            return self._generate_fallback_roadmap(profile_data)
            
        try:
            # Here we would call the actual LLM (e.g. OpenAI structured outputs)
            # return await self._call_real_llm(profile_data)
            return self._generate_fallback_roadmap(profile_data)
        except Exception as e:
            print(f"AI Generation failed: {e}")
            raise Exception("AI generation failed or returned invalid schema")
            
    def _generate_fallback_roadmap(self, data: dict) -> CareerRoadmapSchema:
        goal = data.get("career_goal_text") or data.get("desired_career") or "Software Engineer"
        domain = data.get("desired_domain") or "Technology"
        
        return CareerRoadmapSchema(
            career_goal=goal,
            recommended_domain=domain,
            estimated_focus="6-8 Months",
            explanation=f"Based on your goal to become a {goal}, this structured roadmap covers the essential technical foundations, advanced concepts, and practical applications needed to succeed.",
            phases=[
                PhaseSchema(
                    phase_name="Foundations",
                    milestones=[
                        MilestoneSchema(
                            skill_name="Programming Basics",
                            description="Master data types, loops, conditionals, and functions.",
                            difficulty="Beginner",
                            estimated_time="4 Weeks"
                        ),
                        MilestoneSchema(
                            skill_name="Version Control (Git)",
                            description="Learn branching, merging, and collaborative workflows.",
                            difficulty="Beginner",
                            estimated_time="1 Week"
                        )
                    ]
                ),
                PhaseSchema(
                    phase_name="Core Technologies",
                    milestones=[
                        MilestoneSchema(
                            skill_name="Backend/Frontend Fundamentals",
                            description="Build simple servers, APIs, or interactive UIs.",
                            difficulty="Intermediate",
                            estimated_time="6 Weeks"
                        ),
                        MilestoneSchema(
                            skill_name="Databases",
                            description="Understand relational databases and SQL queries.",
                            difficulty="Intermediate",
                            estimated_time="3 Weeks"
                        )
                    ]
                ),
                PhaseSchema(
                    phase_name="Career Preparation",
                    milestones=[
                        MilestoneSchema(
                            skill_name="Portfolio Projects",
                            description="Build 2-3 end-to-end applications to showcase your skills.",
                            difficulty="Advanced",
                            estimated_time="8 Weeks"
                        ),
                        MilestoneSchema(
                            skill_name="Interview Prep",
                            description="Practice data structures, algorithms, and system design.",
                            difficulty="Advanced",
                            estimated_time="4 Weeks"
                        )
                    ]
                )
            ]
        )
