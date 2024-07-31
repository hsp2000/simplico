document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause');
    const resetButton = document.getElementById('reset');
    let progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const songTitleDisplay = document.getElementById('song-title');
    const simplifyButton = document.getElementById('simplify-btn');
    const resimplifyButton = document.getElementById('re-simplify-btn');
    const playBtn = document.getElementById('play-audio-btn');
    const playBtn2 = document.getElementById('play-audio-btn2');
    const playBtn3 = document.getElementById('play-audio-btn3');
    const transcriptBtn = document.getElementById('transcript-btn');
    const summaryBtn = document.getElementById('summary');
    const keywordsBtn = document.getElementById('keyword-btn');
    const imageBtn = document.getElementById('img-btn');
    const emojiBtn = document.getElementById('emoji-btn');
    const generatedImageContainer = document.getElementById('generated-image-container');
    const generatedEmojiContainer = document.getElementById('generated-emoji-container');
    const keywordImageContainer = document.getElementById('keyword-image-container');
    let keyword=[]
    let simplified="";
    let transcript="";
    let summary="";
    let summaryInterval;
    let fetchController = null;

    // Set the song title from the file name
    const audioSrc = audioPlayer.src;
    const fileName = "Little women - Chapter 1 - Louisa May Alcott"
    let fileFetch="littlewomen";
    const title = fileName.split('.')[0];
    songTitleDisplay.textContent = title;

    playPauseButton.addEventListener('click', function() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.textContent = 'Pause';
        } else {
            audioPlayer.pause();
            playPauseButton.textContent = 'Play';
        }
    });

    resetButton.addEventListener('click', function() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        progressBar.value = 0;
        currentTimeDisplay.textContent = '0:00';
        playPauseButton.textContent = 'Play';
    });

    audioPlayer.addEventListener('timeupdate', function() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    progressBar.addEventListener('input', function() {
        const newTime = (progressBar.value / 37.41) * audioPlayer.duration;
        audioPlayer.currentTime = newTime;
    });

    audioPlayer.addEventListener('loadedmetadata', function() {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    function seekTo() {
        let seekto = audioPlayer.duration * (progressBar.value / 100);
        audioPlayer.currentTime = seekto;
      }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    transcriptBtn.addEventListener('click', function() {
        fetch('/transcript/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({  currentTime: audioPlayer.currentTime })
        }
        )
        .then(response => {
            console.log("Received response:", response); 
            return response.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); 
            var myDiv = document.getElementById('main-transcript');
            if (myDiv.style.display === 'none' || myDiv.style.display === '') {
                myDiv.style.display = 'block';
            } 
            var myDiv2 = document.getElementById('simplify-transcript');
            if (myDiv2.style.display === 'block' ) {
                myDiv2.style.display = 'none';
            } 
            var myDiv3 = document.getElementById('generated');
            myDiv3.style.display = 'none';

            generatedImageContainer.innerHTML =''
            document.getElementById('original-transcription').textContent = data.original;
            document.getElementById('keyword-container').textContent = '';
            document.getElementById('generated-emoji-container').textContent = '';
            document.getElementById('keyword-image-container').textContent = '';
            document.getElementById('keyword-image-container').innerHTML = '';
            document.getElementById('generated-emoji-container').innerHTML = '';
            transcript=data.original;
        })
        .catch(error => console.error('Error:', error));
    });

    function generateSummary() {
        if (!audioPlayer.paused) { 
            const currentTime = audioPlayer.currentTime;
            fetchController = new AbortController();
            fetch('/summary/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken') 
                },
                signal: fetchController.signal,
                body: JSON.stringify({ currentTime: currentTime })
            })
            .then(response => response.json())
            .then(data => {
                var myDiv = document.getElementById('summary');
                if (myDiv.style.display === 'none' || myDiv.style.display === '') {
                    myDiv.style.display = 'block';
                }
                document.getElementById('summaryContainer').innerText = data.summary;
                summary=data.summary;
            })
            .catch(error => console.error('Error:', error));
        }
    }

    //start summary generation when audio starts playing
    audioPlayer.addEventListener('play', function() {
        summaryInterval = setInterval(generateSummary, 15000);
    });

    //stop summary generation when audio pauses or stops
    audioPlayer.addEventListener('pause', function() {
        clearInterval(summaryInterval);

        if (fetchController) {
            fetchController.abort();
            fetchController = null;
        }
    });

    audioPlayer.addEventListener('ended', function() {
        clearInterval(summaryInterval);

        if (fetchController) {
            fetchController.abort();
            fetchController = null;
        }
    });

    simplifyButton.addEventListener('click', function() {
        fetch('/simplify/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ currentTime: audioPlayer.currentTime })
        }
        )
        .then(response => {
            console.log("Received response:", response); // Debugging
            return response.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); 
            var myDiv = document.getElementById('simplify-transcript');
            if (myDiv.style.display === 'none' || myDiv.style.display === '') {
                myDiv.style.display = 'block';
            }
            document.getElementById('original-transcription').textContent = data.original;
            document.getElementById('simplified-transcription').textContent = data.simplified;
            simplified=data.simplified;
        
        })
        .catch(error => console.error('Error:', error));
    });

    resimplifyButton.addEventListener('click', function() {
        fetch('/resimplify/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ text: simplified })
        }
        )
        .then(response => {
            console.log("Received response:", response); // Debugging
            return response.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); 
            document.getElementById('simplified-transcription').textContent = data.simplified;
            simplified=data.simplified;
        })
        .catch(error => console.error('Error:', error));
    });

    keywordsBtn.addEventListener('click', function() {
        fetch('/keywords/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ text: simplified })
        }
        )
        .then(response => {
            console.log("Received response:", response); 
            return response.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); 
            document.getElementById('keyword-container').textContent = data.simplified;
            keyword=data.simplified;
            const originalTranscriptionElement = document.getElementById('original-transcription');
            const simplifiedTranscriptionElement = document.getElementById('simplified-transcription');

            const originalText = originalTranscriptionElement.textContent;
            const simplifiedText = simplifiedTranscriptionElement.textContent;

            const underlinedOriginalText = underlineKeywords(originalText, keyword);
            const underlinedSimplifiedText = underlineKeywords(simplifiedText, keyword);

            originalTranscriptionElement.innerHTML = underlinedOriginalText;
            simplifiedTranscriptionElement.innerHTML = underlinedSimplifiedText;
        })
        .catch(error => console.error('Error:', error));
    });

    function underlineKeywords(text, keywords) {
        let underlinedText = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            underlinedText = underlinedText.replace(regex, `<u>${keyword}</u>`);
        });
        return underlinedText;
    }

    imageBtn.addEventListener('click', function() {
        simplified = document.getElementById('simplified-transcription').textContent;
        fetch('/getimg/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ text: simplified })
        }
        )
        .then(response => {
            console.log("Received response:", response); 
            return response.text();  
        })
        .then(responseText => {
            console.log("Response text:", responseText); 
            const data = JSON.parse(responseText); 
            if (data.image_urls) {
                var myDiv3 = document.getElementById('generated');
                if (myDiv3.style.display === 'none' ) {
                    myDiv3.style.display = 'block';
                } 
                keyword=data.keywords;
                let keywordsHTML = keyword.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

                keywordImageContainer.innerHTML = keywordsHTML;
                generatedImageContainer.innerHTML = data.image_urls.map(url => `<img src="${url}" alt="Generated Image" width="256" height="256">`).join('            ');
                document.getElementById('keyword-container').textContent = data.keywords;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    emojiBtn.addEventListener('click', function() {
        simplified = document.getElementById('simplified-transcription').textContent;
        fetch('/getemoji/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ text: simplified })
        }
        )
        .then(response => {
            console.log("Received response:", response); 
            return response.text();  
        })
        .then(responseText => {
            console.log("Response text:", responseText); 
            const data = JSON.parse(responseText); 
            if (data.content) {
                var myDiv3 = document.getElementById('generated');
                if (myDiv3.style.display === 'none' ) {
                    myDiv3.style.display = 'block';
                } 
                emojis=data.content;
                document.getElementById('generated-emoji-container').textContent = emojis;
    
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function resetAudioPlayer() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        progressBar.value = 0;
        currentTimeDisplay.textContent = '0:00';
        playPauseButton.textContent = 'Play';
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    playBtn.addEventListener('click', function() {
        if (!simplified) {
            console.error("Transcription text is not defined.");
            return;
        }

        console.log("reading");
        console.log(simplified);
        readText(simplified);
        
    });

    playBtn2.addEventListener('click', function() {
        if (!transcript) {
            console.error("Transcription text is not defined.");
            return;
        }
        console.log("reading");
        console.log(transcript);
        readText(transcript);
        
    });

    playBtn3.addEventListener('click', function() {
        if (!summary) {
            console.error("summary text is not defined.");
            return;
        }
        console.log("reading");
        console.log(summary);
        readText(summary);
        
    });

    function readText(text) {
        const speechSynthesis = window.speechSynthesis;
        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = 'en-US';
        speech.pitch = 0.8; 
        speech.rate = 0.5; 
        speech.volume = 1.0; 
        speechSynthesis.speak(speech);
    }
    
});
