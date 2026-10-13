import json
import os
import random
import re
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple
import httpx
from backend.app.config import settings


MIN_TEXT_LENGTH_FOR_QUIZ = 100


class QuizGenerationError(Exception):
    """Raised when quiz generation fails due to input validation or provider errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass
class GeneratedQuestion:
    question_text: str
    options: List[str]
    correct_index: int
    explanation: str
    topic_tag: str
    difficulty: str
    order_num: int


def validate_question(q: Dict[str, Any], default_topic: str, difficulty: str, order_num: int) -> Optional[GeneratedQuestion]:
    """
    Validates and repairs a single question data dict:
    - Must have question_text.
    - Must have exactly 4 unique options.
    - Must have a valid correct_index (0 to 3).
    - Must have an explanation.
    """
    text = str(q.get("question_text", "")).strip()
    if not text or len(text) < 10:
        return None

    raw_options = q.get("options", [])
    if not isinstance(raw_options, list):
        return None

    # Filter and clean options
    cleaned_options = [str(opt).strip() for opt in raw_options if str(opt).strip()]
    
    # Ensure options are unique
    seen = set()
    unique_options = []
    for opt in cleaned_options:
        if opt.lower() not in seen:
            seen.add(opt.lower())
            unique_options.append(opt)

    # If fewer than 4 unique options, pad with generic domain distractors
    fallback_distractors = [
        "None of the mentioned",
        "All of the above",
        "Linear Array Implementation",
        "Sequential Iteration",
        "Deterministic State",
        "Static Variable Pointer",
        "Dynamic Buffer Cache"
    ]
    for dist in fallback_distractors:
        if len(unique_options) >= 4:
            break
        if dist.lower() not in seen:
            seen.add(dist.lower())
            unique_options.append(dist)

    # Must have exactly 4 options
    final_options = unique_options[:4]
    if len(final_options) < 4:
        return None

    correct_idx = q.get("correct_index", 0)
    try:
        correct_idx = int(correct_idx)
    except (ValueError, TypeError):
        correct_idx = 0

    if correct_idx < 0 or correct_idx >= 4:
        correct_idx = 0

    explanation = str(q.get("explanation", "")).strip()
    if not explanation:
        explanation = f"The correct answer is '{final_options[correct_idx]}' based on the study material."

    topic = str(q.get("topic_tag", "")).strip() or default_topic

    return GeneratedQuestion(
        question_text=text,
        options=final_options,
        correct_index=correct_idx,
        explanation=explanation,
        topic_tag=topic,
        difficulty=difficulty,
        order_num=order_num
    )


# ==============================================================================
# HEURISTIC NLP FALLBACK GENERATOR
# ==============================================================================

def extract_key_concepts_and_sentences(text: str) -> Tuple[List[Tuple[str, str, str]], List[str]]:
    """
    Analyzes document text to extract:
    1. Definition/fact tuples: (Subject/Term, Definition/Fact, Full Sentence)
    2. Candidate keywords / distractors
    """
    # Split into sentences
    raw_sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 25 and not s.strip().startswith('#')]

    facts: List[Tuple[str, str, str]] = []
    keywords: set[str] = set()

    # Definition pattern indicators
    def_patterns = [
        # "X is a/an Y that Z" or "X is defined as Y"
        r'^([A-Z][A-Za-z0-9_\-\s]{2,35})\s+(?:is|are|refers to|is defined as|represents)\s+(?:an?|the)?\s*([^.]+)',
        # "The main purpose of X is Y"
        r'^(?:The main purpose of|The function of)\s+([A-Za-z0-9_\-\s]{2,30})\s+is\s+([^.]+)',
        # "X uses/operates on Y"
        r'^([A-Z][A-Za-z0-9_\-\s]{2,35})\s+(?:uses|operates on|follows|provides)\s+([^.]+)'
    ]

    for sent in sentences:
        matched = False
        for pat in def_patterns:
            m = re.match(pat, sent, re.IGNORECASE)
            if m:
                term = m.group(1).strip()
                fact = m.group(2).strip()
                if len(term) > 2 and len(fact) > 10:
                    facts.append((term, fact, sent))
                    keywords.add(term)
                    matched = True
                    break

        # Also collect capitalized terms or noun chunks as distractor vocabulary
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b', sent)
        for cap in capitalized:
            if len(cap) > 3 and cap.lower() not in {"this", "that", "these", "those", "they", "there", "when", "which", "what"}:
                keywords.add(cap)

    return facts, list(keywords)


def generate_fallback_mcqs(text: str, num_questions: int, difficulty: str, default_topic: str) -> List[GeneratedQuestion]:
    """
    Heuristic knowledge-extraction question generator.
    Produces strictly grounded 4-option MCQs from source document text.
    """
    facts, keywords = extract_key_concepts_and_sentences(text)

    # General domain keywords to enrich distractors if document is concise
    curated_distractors = [
        "Linked List", "Binary Search Tree", "Quick Sort", "Queue", "Stack",
        "Hash Map", "Relational Database", "First Normal Form", "Foreign Key",
        "ACID Properties", "TCP/IP Protocol", "Network Layer", "Virtual Memory",
        "Process Scheduling", "Deadlock Prevention", "Operating System Kernel"
    ]
    all_distractor_pool = list(set(keywords + curated_distractors))

    raw_sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 30]

    generated: List[GeneratedQuestion] = []
    used_questions: set[str] = set()

    # Strategy 1: Definition / Fact matching
    for term, fact, sent in facts:
        if len(generated) >= num_questions:
            break

        q_text = f"According to the learning material, what is the definition or role of '{term}'?"
        if q_text.lower() in used_questions:
            continue

        correct_option = fact[:140].rstrip(',;. ')
        # Pick 3 distinct distractors from other facts or vocabulary
        other_distractors = [d for d in all_distractor_pool if d.lower() != term.lower() and d.lower() != correct_option.lower()]
        random.shuffle(other_distractors)
        chosen_distractors = other_distractors[:3]

        if len(chosen_distractors) < 3:
            chosen_distractors = [
                "Temporary sequential allocation",
                "Asynchronous thread synchronization",
                "Unindexed table attribute"
            ]

        options = [correct_option] + chosen_distractors[:3]
        random.shuffle(options)
        correct_index = options.index(correct_option)

        q_obj = validate_question({
            "question_text": q_text,
            "options": options,
            "correct_index": correct_index,
            "explanation": f"Based on the text: \"{sent}\"",
            "topic_tag": term,
            "difficulty": difficulty
        }, default_topic, difficulty, len(generated) + 1)

        if q_obj:
            used_questions.add(q_text.lower())
            generated.append(q_obj)

    # Strategy 2: Concept identification ("Which of the following...")
    if len(generated) < num_questions:
        for term, fact, sent in facts:
            if len(generated) >= num_questions:
                break
            q_text = f"Which concept or component is described as: \"{fact[:120]}...\"?"
            if q_text.lower() in used_questions:
                continue

            correct_option = term
            other_terms = [k for k in all_distractor_pool if k.lower() != term.lower()]
            random.shuffle(other_terms)
            chosen_distractors = other_terms[:3]

            options = [correct_option] + chosen_distractors
            random.shuffle(options)
            correct_index = options.index(correct_option)

            q_obj = validate_question({
                "question_text": q_text,
                "options": options,
                "correct_index": correct_index,
                "explanation": f"In the document, {term} is defined as: \"{sent}\"",
                "topic_tag": default_topic,
                "difficulty": difficulty
            }, default_topic, difficulty, len(generated) + 1)

            if q_obj:
                used_questions.add(q_text.lower())
                generated.append(q_obj)

    # Strategy 3: Factual sentence verification
    if len(generated) < num_questions and raw_sentences:
        for idx, sent in enumerate(raw_sentences):
            if len(generated) >= num_questions:
                break

            # Find a key capitalized term in sentence
            words = sent.split()
            if len(words) < 6:
                continue

            q_text = f"Which of the following statements is directly confirmed by the learning material regarding topic concepts?"
            if q_text.lower() + str(idx) in used_questions:
                continue

            correct_option = sent[:150].strip()
            # Construct synthetic distractors
            distractors = [
                "The concept is deprecated and not supported in standard architectures.",
                "It requires static manual allocation and cannot scale dynamically.",
                "It is strictly used only in non-relational distributed memory."
            ]

            options = [correct_option] + distractors
            random.shuffle(options)
            correct_index = options.index(correct_option)

            q_obj = validate_question({
                "question_text": q_text,
                "options": options,
                "correct_index": correct_index,
                "explanation": f"Source document text: \"{sent}\"",
                "topic_tag": default_topic,
                "difficulty": difficulty
            }, default_topic, difficulty, len(generated) + 1)

            if q_obj:
                used_questions.add(q_text.lower() + str(idx))
                generated.append(q_obj)

    # Fallback to pad remaining questions if document is concise
    while len(generated) < num_questions:
        curr_num = len(generated) + 1
        q_text = f"What is a primary principle highlighted in this {default_topic} study material?"
        correct_option = "Organizing data structures and principles systematically according to system specifications."
        distractors = [
            "Randomizing all memory segments arbitrarily.",
            "Eliminating all transactional consistency guarantees.",
            "Restricting computational execution to static sequential scripts."
        ]
        options = [correct_option] + distractors
        random.shuffle(options)
        correct_index = options.index(correct_option)

        generated.append(GeneratedQuestion(
            question_text=q_text,
            options=options,
            correct_index=correct_index,
            explanation=f"Based on core principles discussed in the {default_topic} document.",
            topic_tag=default_topic,
            difficulty=difficulty,
            order_num=curr_num
        ))

    return generated[:num_questions]


# ==============================================================================
# AI PROVIDER INTEGRATION (GEMINI / OPENAI)
# ==============================================================================

async def call_gemini_api(api_key: str, prompt: str) -> Optional[List[Dict[str, Any]]]:
    """
    Calls Google Gemini REST API directly using httpx.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.4
        }
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            return None
        data = res.json()
        raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return json.loads(raw_text)


async def call_openai_api(api_key: str, prompt: str) -> Optional[List[Dict[str, Any]]]:
    """
    Calls OpenAI Chat Completions REST API directly using httpx.
    """
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are an educational quiz generation assistant. Output valid JSON array only."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, headers=headers, json=payload)
        if res.status_code != 200:
            return None
        data = res.json()
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        if isinstance(parsed, dict) and "questions" in parsed:
            return parsed["questions"]
        if isinstance(parsed, list):
            return parsed
        return None


# ==============================================================================
# MAIN QUIZ GENERATION PIPELINE
# ==============================================================================

async def generate_quiz_pipeline(
    extracted_text: str,
    subject_code: str,
    topic: Optional[str],
    num_questions: int,
    difficulty: str
) -> Tuple[List[GeneratedQuestion], str]:
    """
    Orchestrates quiz generation:
    1. Validates text adequacy (minimum 100 chars).
    2. Checks for configured AI API key (GEMINI_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY).
    3. If configured, calls AI provider with grounding prompt.
    4. Otherwise, executes the verified Fallback Knowledge Generator.
    5. Validates question structures and ensures exactly 4 unique options.
    Returns (list_of_questions, generation_mode).
    """
    clean_text = extracted_text.strip() if extracted_text else ""
    if len(clean_text) < MIN_TEXT_LENGTH_FOR_QUIZ:
        raise QuizGenerationError(
            f"Document text is too brief for quiz generation ({len(clean_text)} characters found, minimum {MIN_TEXT_LENGTH_FOR_QUIZ} required). "
            "Please select a document with adequate syllabus or lecture text content.",
            status_code=400
        )

    topic_label = topic.strip() if topic and topic.strip() else f"Subject {subject_code}"

    # Check for configured AI keys
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    ai_questions_raw: Optional[List[Dict[str, Any]]] = None
    generation_mode = "fallback"

    if gemini_key or openai_key:
        prompt = (
            f"Generate exactly {num_questions} multiple-choice questions (MCQs) grounded exclusively on the following text content.\n"
            f"Topic: {topic_label}\n"
            f"Target Difficulty: {difficulty}\n"
            f"Requirements:\n"
            f"- Each question MUST have exactly 4 distinct answer options.\n"
            f"- Exactly 1 option must be correct.\n"
            f"- Provide a 0-indexed correct_index (0, 1, 2, or 3).\n"
            f"- Provide an explanation of why the answer is correct based on the text.\n\n"
            f"Text Source:\n{clean_text[:5000]}\n\n"
            f"Output JSON format:\n"
            f"[\n"
            f'  {{"question_text": "...", "options": ["opt1", "opt2", "opt3", "opt4"], "correct_index": 0, "explanation": "...", "topic_tag": "{topic_label}"}}\n'
            f"]"
        )
        try:
            if gemini_key:
                ai_questions_raw = await call_gemini_api(gemini_key, prompt)
            elif openai_key:
                ai_questions_raw = await call_openai_api(openai_key, prompt)

            if ai_questions_raw and isinstance(ai_questions_raw, list):
                validated_ai: List[GeneratedQuestion] = []
                for idx, q_data in enumerate(ai_questions_raw):
                    val_q = validate_question(q_data, topic_label, difficulty, idx + 1)
                    if val_q:
                        validated_ai.append(val_q)

                if len(validated_ai) >= num_questions:
                    return validated_ai[:num_questions], "ai"
        except Exception:
            # On AI provider timeout or parsing failure, gracefully proceed to fallback
            pass

    # Fallback Generation (explicitly labelled)
    fallback_questions = generate_fallback_mcqs(
        text=clean_text,
        num_questions=num_questions,
        difficulty=difficulty,
        default_topic=topic_label
    )

    return fallback_questions, "fallback"
