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
    // const audioList = document.getElementById('audio-list');
    const playBtn = document.getElementById('play-audio-btn');
    // const backwardButton = document.getElementById('backward');
    // const forwardButton = document.getElementById('forward');
    const transcriptBtn = document.getElementById('transcript-btn');
    const keywordsBtn = document.getElementById('keyword-btn');
    const imageBtn = document.getElementById('img-btn');
    const generatedImageContainer = document.getElementById('generated-image-container');

    let simplified="";

    // Set the song title from the file name
    const audioSrc = audioPlayer.src;
    // const fileName = audioSrc.substring(audioSrc.lastIndexOf('/') + 1);
    const fileName = "Harry Potter and the Half Blood Prince - Chapter 1"
    let fileFetch="harrypotter";
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

    // backwardButton.addEventListener('click', function() {
    //     audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    // });

    // forwardButton.addEventListener('click', function() {
    //     audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    // });

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
        // const fileName = target.getAttribute('data-file');
        // Fetch transcription and simplified text from the backend
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
            console.log("Received response:", response); // Debugging
            return response.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); // Debugging
            // originalTranscription.textContent = data.transcription;
            // simplifiedTranscription.textContent = data.simplified_transcription;
            // document.getElementById('original-transcription').textContent =  data.transcription;
            // document.getElementById('simplified-transcription').textContent = data.simplified_transcription;
            var myDiv = document.getElementById('main-transcript');
            if (myDiv.style.display === 'none' || myDiv.style.display === '') {
                myDiv.style.display = 'block';
            } 
            var myDiv2 = document.getElementById('simplify-transcript');
            if (myDiv2.style.display === 'block' ) {
                myDiv2.style.display = 'none';
            } 
            generatedImageContainer.innerHTML =''
            document.getElementById('original-transcription').textContent = data.original;
            document.getElementById('keyword-container').textContent = ''
            // document.getElementById('simplified-transcription').textContent = data.simplified;
            // simplified=data.simplified;
        
        })
        .catch(error => console.error('Error:', error));
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
        // const fileName = target.getAttribute('data-file');
        // Fetch transcription and simplified text from the backend
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
            console.log("Parsed response data:", data); // Debugging
            // originalTranscription.textContent = data.transcription;
            // simplifiedTranscription.textContent = data.simplified_transcription;
            // document.getElementById('original-transcription').textContent =  data.transcription;
            // document.getElementById('simplified-transcription').textContent = data.simplified_transcription;
            //document.getElementById('original-transcription').textContent = data.original;
            document.getElementById('simplified-transcription').textContent = data.simplified;
            simplified=data.simplified;
        })
        .catch(error => console.error('Error:', error));
    });

    keywordsBtn.addEventListener('click', function() {
        // const fileName = target.getAttribute('data-file');
        // Fetch transcription and simplified text from the backend
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
            
        })
        .catch(error => console.error('Error:', error));
    });

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
            console.log("Received response:", response); // Log the response object
            return response.text();  // Get the raw response text
        })
        .then(responseText => {
            console.log("Response text:", responseText); // Log the raw response text
            const data = JSON.parse(responseText); // Attempt to parse the JSON response
            if (data.image_urls) {
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
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Handle audio file click
    // audioList.addEventListener('click', function(event) {
    //     event.preventDefault();
    //     if (event.target.classList.contains('audio-file')) {
    //         const fileName = event.target.getAttribute('data-file');
    //         audioPlayer.src = `${staticBaseURL}${fileName}`;
    //         audioPlayer.pause();
    //         audioPlayer.currentTime = 0;
    //         // progressBar.value = 0;
    //         currentTimeDisplay.textContent = '0:00';
    //         songTitleDisplay.textContent = fileName.split('.')[0];
    //         playPauseButton.textContent = 'Play';
    //         fileFetch=fileName;
    //         progressBar.value = 0;
    //         startTimeBar.value = 0;
    //         totalTimeDisplay.textContent = audioPlayer.duration;
    //         document.getElementById('original-transcription').textContent = "";
    //         document.getElementById('simplified-transcription').textContent = "";
        
    //     }
    // });
    // audioList.addEventListener('click', function(event) {
    //     event.preventDefault();
    //     if (event.target.classList.contains('audio-file')) {
    //         const fileName = event.target.getAttribute('data-file');
    //         audioPlayer.src = `${staticBaseURL}${fileName}`;
    //         audioPlayer.pause();
    //         audioPlayer.currentTime = 0;
    //         currentTimeDisplay.textContent = '0:00';
    //         songTitleDisplay.textContent = fileName.split('.')[0];
    //         playPauseButton.textContent = 'Play';
    //         fileFetch = fileName;
    //         // progressBar.value = 0;
    //         // startTimeBar.value = 0;
    //         document.getElementById('original-transcription').textContent = "";
    //         document.getElementById('simplified-transcription').textContent = "";
    //         generatedImageContainer.innerHTML = "";
    
    //         // Wait for the metadata to be loaded before updating duration-related elements
    //         audioPlayer.addEventListener('loadedmetadata', function() {
    //             totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    //         }, { once: true });

    //         resetAudioPlayer();
    //     }
    // });

    function resetAudioPlayer() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        progressBar.value = 0;
        currentTimeDisplay.textContent = '0:00';
        playPauseButton.textContent = 'Play';
    }
    
    // Helper function to format time in minutes and seconds
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
        transcription= simplified;
        console.log("reading");
        console.log(transcription);
        readText(transcription);
        
    });

    function readText(text) {
        const speechSynthesis = window.speechSynthesis;
        const speech = new SpeechSynthesisUtterance(text);
    
        // Customizations
        speech.lang = 'en-US';
        speech.pitch = 0.8; // Slightly higher pitch
        speech.rate = 0.5; // Normal speed
        speech.volume = 1.0; // Full volume
        // speech.voice = "Google UK English Male (en-GB)";
        speechSynthesis.speak(speech);
    }
    
});
