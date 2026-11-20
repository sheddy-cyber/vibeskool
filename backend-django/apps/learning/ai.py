"""The AI tutor: lesson questions (chat) and exercise hints, answered by Gemini.

Needs GEMINI_API_KEY in the environment. Without it the endpoints answer
503, and the lesson page shows that the tutor is offline.
"""
import json
import logging

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

log = logging.getLogger(__name__)

GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
MAX_MESSAGE = 8000

PERSONAS = {
    'friendly': 'You are a warm, supportive and encouraging coding teacher. Answer in simple terms, under 130 words. Encourage the student.',
    'socrates': 'You are a Socratic tutor. Do NOT give the answer directly. Ask 1-2 guiding questions that help the student work it out. Under 140 words.',
    'auditor': 'You are a security expert. Explain code in terms of possible exploits, bugs and standard protections (CSRF, SQL injection, password safety). Under 140 words.',
}


class TutorThrottle(UserRateThrottle):
    """Each question costs money; keep it to a sensible pace per person."""
    scope = 'ai'
    rate = '20/min'


class Unavailable(Exception):
    pass


def ask_gemini(prompt, system=None, temperature=0.7):
    key = settings.GEMINI_API_KEY
    if not key:
        raise Unavailable()
    body = {
        'contents': [{'role': 'user', 'parts': [{'text': prompt}]}],
        'generationConfig': {'temperature': temperature},
    }
    if system:
        body['systemInstruction'] = {'parts': [{'text': system}]}
    res = requests.post(
        GEMINI_URL.format(model=settings.GEMINI_MODEL),
        headers={'x-goog-api-key': key, 'Content-Type': 'application/json'},
        data=json.dumps(body),
        timeout=30,
    )
    res.raise_for_status()
    parts = res.json().get('candidates', [{}])[0].get('content', {}).get('parts', [])
    return ''.join(p.get('text', '') for p in parts).strip()


class ChatView(APIView):
    """POST {message, persona, lessonContext} → {reply}"""
    throttle_classes = [TutorThrottle]

    def post(self, request):
        message = str(request.data.get('message') or '').strip()[:MAX_MESSAGE]
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        ctx = request.data.get('lessonContext') or {}
        if not isinstance(ctx, dict):
            ctx = {}
        system = (
            f"{PERSONAS.get(request.data.get('persona'), PERSONAS['friendly'])}\n\n"
            'Context about the lesson the student is on:\n'
            f"Title: {str(ctx.get('title') or 'Unknown')[:200]}\n"
            f"Lesson goal: {str(ctx.get('mekLabel') or 'Unknown')[:200]}\n"
            f"Lesson summary: {json.dumps(ctx.get('sections') or [])[:600]}"
        )
        try:
            return Response({'reply': ask_gemini(message, system)})
        except Unavailable:
            return Response({'error': 'AI Tutor is currently unavailable.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (requests.RequestException, KeyError, IndexError, ValueError):
            log.exception('AI chat failed')
            return Response({'error': 'Failed to generate response'}, status=status.HTTP_502_BAD_GATEWAY)


class HintView(APIView):
    """POST {code, instructions, errors} → {hint} (a nudge, never the answer)"""
    throttle_classes = [TutorThrottle]

    def post(self, request):
        d = request.data
        prompt = (
            'You are a coding tutor. The student is stuck on an exercise.\n'
            f"Instructions: {str(d.get('instructions') or '')[:2000]}\n"
            f"Their code:\n{str(d.get('code') or '')[:6000]}\n"
            f"Test failures:\n{str(d.get('errors') or '')[:2000]}\n\n"
            'Give a small, conceptual hint about what is wrong or what to check. '
            'Keep it under 2 sentences. Do NOT write the corrected code.'
        )
        try:
            return Response({'hint': ask_gemini(prompt, temperature=0.4)})
        except Unavailable:
            return Response({'error': 'AI is disabled (no API key)'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (requests.RequestException, KeyError, IndexError, ValueError):
            log.exception('AI hint failed')
            return Response({'error': 'Failed to generate hint'}, status=status.HTTP_502_BAD_GATEWAY)
