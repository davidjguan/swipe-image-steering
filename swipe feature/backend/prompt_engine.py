def build_image_prompt(brief: str, preference_profile: dict) -> str:
    """
    Build the image generation prompt based on the brief and preference profile.
    If preference_profile is empty, return the brief as-is.
    Otherwise append the next_prompt_modifier.
    """
    if not preference_profile or not preference_profile.get("next_prompt_modifier"):
        return brief
    
    modifier = preference_profile["next_prompt_modifier"]
    return f"{brief}, {modifier}"
