Simplico is a Django web application that simplifies and transcribes audio files. It uses the OpenAI API for various features such as transcription, simplification of transcripts, generation of summaries, keywords, emojis, and images based on the transcript content.

Features

Audio Transcription: Converts audio files to text. Simplified Transcription: Provides a simplified version of the transcribed text. Resimplification: Further simplifies the transcribed text. Summarization: Generates summaries of the transcribed content. Keyword Extraction: Identifies keywords from the transcription. Emoji Generation: Summarizes content using emojis. Image Generation: Creates images based on keywords extracted from the transcript.

Installation:

git clone https://github.com/hsp2000/simplico.git cd simplico

Create and activate a virtual environment: python3 -m venv env source env/bin/activate

Install dependencies: pip install -r requirements.txt

Replace openAI apikey in file views.py

Run the development server: python manage.py runserver
