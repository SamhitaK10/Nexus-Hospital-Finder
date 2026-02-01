from langgraph.graph import StateGraph, END
from typing import TypedDict
import json

# Load hospitals
with open('hospitals_data.json', 'r') as f:
    hospitals = json.load(f)

# Define state
class HospitalState(TypedDict):
    user_message: str
    symptoms: str
    urgency: str
    recommended_hospitals: list
    final_recommendation: dict
    reasoning: str

# Agent 1: Triage Agent
def triage_agent(state: HospitalState):
    message = state["user_message"].lower()
    
    # Simple triage logic
    if any(word in message for word in ["chest", "heart", "cardiac"]):
        return {
            **state,
            "symptoms": "cardiac",
            "urgency": "critical",
        }
    elif any(word in message for word in ["child", "kid", "baby"]):
        return {
            **state,
            "symptoms": "pediatric",
            "urgency": "moderate",
        }
    elif any(word in message for word in ["pregnancy", "labor", "baby"]):
        return {
            **state,
            "symptoms": "maternity",
            "urgency": "urgent",
        }
    else:
        return {
            **state,
            "symptoms": "general",
            "urgency": "routine",
        }

# Agent 2: Hospital Finder Agent
def finder_agent(state: HospitalState):
    symptoms = state["symptoms"]
    
    # Filter hospitals based on symptoms
    filtered = []
    
    for h in hospitals:
        if symptoms == "cardiac":
            if any("cardiac" in s.lower() for s in h.get("specialties", [])) and h["beds"]["er"] > 0:
                filtered.append(h)
        elif symptoms == "pediatric":
            if h["beds"]["pediatric"] > 0:
                filtered.append(h)
        elif symptoms == "maternity":
            if h["beds"]["maternity"] > 0:
                filtered.append(h)
        else:
            if h["availableBeds"] > 0:
                filtered.append(h)
    
    # Sort by availability
    filtered.sort(key=lambda x: x["availableBeds"], reverse=True)
    
    return {
        **state,
        "recommended_hospitals": filtered[:3]  # Top 3
    }

# Agent 3: Recommendation Agent
def recommendation_agent(state: HospitalState):
    hospitals_list = state["recommended_hospitals"]
    
    if not hospitals_list:
        return {
            **state,
            "final_recommendation": {},
            "reasoning": "No hospitals found matching your criteria."
        }
    
    # Pick best one
    best = hospitals_list[0]
    
    reasoning = f"""
    I recommend {best['name']} because:
    - {best['availableBeds']} beds available
    - Wait time: {best['waitTime']} minutes
    - Location: {best['city']}, {best['state']}
    - Specialties: {', '.join(best['specialties'])}
    - Urgency level: {state['urgency']}
    """
    
    return {
        **state,
        "final_recommendation": best,
        "reasoning": reasoning.strip()
    }

# Build the graph
workflow = StateGraph(HospitalState)

# Add agents as nodes
workflow.add_node("triage", triage_agent)
workflow.add_node("finder", finder_agent)
workflow.add_node("recommender", recommendation_agent)

# Define flow
workflow.set_entry_point("triage")
workflow.add_edge("triage", "finder")
workflow.add_edge("finder", "recommender")
workflow.add_edge("recommender", END)

# Compile
app = workflow.compile()

# Function to run agents
def get_recommendation(user_message: str):
    result = app.invoke({
        "user_message": user_message,
        "symptoms": "",
        "urgency": "",
        "recommended_hospitals": [],
        "final_recommendation": {},
        "reasoning": ""
    })
    
    return {
        "hospital": result["final_recommendation"],
        "reasoning": result["reasoning"],
        "urgency": result["urgency"]
    }