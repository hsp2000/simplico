from django.shortcuts import render
import openai
import speech_recognition as sr
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import logging
import json
import wave
import contextlib

# OPENAI_API_KEY = Update with your openAI key here or set it as an env variable

logging.basicConfig(level=logging.INFO)


def index(request):
    audio_dir = os.path.join('dataset', 'wavs')
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith('.wav')]
    audio_files2 = [f for f in os.listdir(audio_dir) if f.endswith('.mp3')]

    context = {
        'audio_files': audio_files+audio_files2,
    }
    return render(request, 'myapp/index.html', context)

def transcribe_audio(audio_file_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio_data = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio_data)
        return text
    except sr.UnknownValueError:
        return "Google Speech Recognition could not understand the audio"
    except sr.RequestError as e:
        return f"Could not request results from Google Speech Recognition service; {e}"


def get_transcription(audiopath,current_time,summary):
        
        audio_file_path = audiopath  
        with contextlib.closing(wave.open(audio_file_path, 'r')) as wav_file:
            duration = wav_file.getnframes() / float(wav_file.getframerate())

        if summary==True :
            start_time = 0
        else:
            start_time = max(current_time - 10, 0)
        end_time = current_time
        recognizer = sr.Recognizer()

        with wave.open(audio_file_path, 'rb') as wav_file:
            frame_rate = wav_file.getframerate()
            start_frame = int(start_time * frame_rate)
            end_frame = int(end_time * frame_rate)
            wav_file.setpos(start_frame)
            frames = wav_file.readframes(end_frame - start_frame)
        
        segment_path = "segment.wav"
        with wave.open(segment_path, 'wb') as segment_file:
            segment_file.setnchannels(wav_file.getnchannels())
            segment_file.setsampwidth(wav_file.getsampwidth())
            segment_file.setframerate(frame_rate)
            segment_file.writeframes(frames)

        transcription = transcribe_audio(segment_path)
        # os.remove(segment_path)  
        return transcription


def simplify_transcript(transcript, api_key):
    openai.api_key = api_key

    completion = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"make this description as simple wording as possible:\n\n{transcript}",
            },
        ],
    )
    
    simplified_text = completion.choices[0].message.content
    return simplified_text

def resimplify_transcript(transcript, api_key):
    openai.api_key = api_key

    completion = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"simplify this description as much as possible, minimal words, omit unnecessary punctuation and make it grammatically as simple as possible:\n\n{transcript}",
            },
        ],
    )
    
    simplified_text = completion.choices[0].message.content
    return simplified_text

def get_emojis(transcript, api_key):
    openai.api_key = api_key

    completion = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"summarize this description with 4 emojis :\n\n{transcript}",
            },
        ],
    )
    
    emojis = completion.choices[0].message.content
    return emojis

def get_keywords(transcript, api_key):
    openai.api_key = api_key

    completion = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"send a list of maximum 4 ideally only noun keywords, that have a distinct corresponding single emoji. ignore keywords that cant generate a specific picture. Use this description to extract keywords, return a singular string:\n\n{transcript}",
            },
        ],
    )
    
    keywords = completion.choices[0].message.content

    input_string = keywords.strip('"')
    
    items = input_string.split('", "')
    
    items = [item.strip('"') for item in items]
    
    return items



@csrf_exempt
def generate_images(request):
    import requests
    import base64
    openai.api_key = OPENAI_API_KEY
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            transcript = data.get('text')
            words=get_keywords(transcript,openai.api_key)

            if not isinstance(words, list):
                return JsonResponse({'error': 'Input should be a list of words'}, status=400)

            image_urls = []

            for word in words:
                response = openai.images.generate(
                    prompt=word,
                    n=1,
                    size="256x256",
                    response_format="url"  
                )
            
                image_url = response.data[0].url
                print(image_url)
                image_urls.append(image_url)

            return JsonResponse({'image_urls': image_urls, 'keywords':words})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Unexpected response structure'}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def summary(request):
    openai.api_key = OPENAI_API_KEY
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            currentTime = body.get('currentTime')

            audio_path = os.path.join('dataset', 'wavs', "littlewomen.wav")
            logging.info(f"Audio file received: {audio_path}")

            if not os.path.exists(audio_path):
                logging.error(f"Audio file not found: {audio_path}")
                return JsonResponse({'error': 'Audio file not found {audio_path}'}, status=404)

            api_key = OPENAI_API_KEY

            transcription = get_transcription(audio_path,currentTime,True)

            summary = get_summary(transcription,openai.api_key)
            data = {
                'summary': summary
            }
            return JsonResponse(data)
        
        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_summary(transcript, api_key):
    openai.api_key = api_key

    completion = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"generate a summary of the story so far. make it as simple as possible:\n\n{transcript}",
            },
        ],
    )
    
    simplified_text = completion.choices[0].message.content
    return simplified_text

@csrf_exempt
def transcript(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            currentTime = body.get('currentTime')

            audio_path = os.path.join('dataset', 'wavs', "littlewomen.wav")
            logging.info(f"Audio file received: {audio_path}")

            if not os.path.exists(audio_path):
                logging.error(f"Audio file not found: {audio_path}")
                return JsonResponse({'error': 'Audio file not found {audio_path}'}, status=404)

            api_key =OPENAI_API_KEY

            transcription = get_transcription(audio_path,currentTime,False)

            data = {
                'original': transcription
            }
            return JsonResponse(data)
        
        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def simplify(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            currentTime = body.get('currentTime')

            audio_path = os.path.join('dataset', 'wavs', "littlewomen.wav")
            logging.info(f"Audio file received: {audio_path}")

            if not os.path.exists(audio_path):
                logging.error(f"Audio file not found: {audio_path}")
                return JsonResponse({'error': 'Audio file not found {audio_path}'}, status=404)

            api_key = OPENAI_API_KEY

            transcription = get_transcription(audio_path,currentTime,False)
            simplified_transcription = simplify_transcript(transcription, api_key)
            data = {
                'original': transcription,
                'simplified': simplified_transcription
            }
            return JsonResponse(data)

        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def resimplify(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            simplified = body.get('text')

            api_key = OPENAI_API_KEY

            simplified_transcription = resimplify_transcript(simplified, api_key)
            data = {
                'simplified': simplified_transcription
            }
            return JsonResponse(data)

        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def keywords(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            simplified = body.get('text')

            api_key = OPENAI_API_KEY

            keywords = get_keywords(simplified, api_key)
            data = {
                'simplified': keywords
            }
            return JsonResponse(data)

        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def generate_emojis(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            simplified = body.get('text')

            api_key = OPENAI_API_KEY

            emojis = get_emojis(simplified, api_key)
            data = {
                'content': emojis
            }
            return JsonResponse(data)

        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from request body.")
            return JsonResponse({'error': 'Invalid JSON, audio path is:'}, status=400)
        except Exception as e:
            logging.exception("An error occurred while processing the request.")
            return JsonResponse({'error': 'An error occurred', 'details': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)


