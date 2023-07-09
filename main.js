import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import './style.css'

// document.querySelector('#app').innerHTML = ``

const btnStartRecord = document.querySelector('#btn-start-record')
const btnStopRecord = document.querySelector('#btn-stop-record')
const btnMerge = document.querySelector('#btn-merge')
const btnPreview = document.querySelector('#btn-preview')
const btnDownloadVideo = document.querySelector('#btn-download-video')
const btnDownloadAudio = document.querySelector('#btn-download-audio')
const btnDownloadMerge = document.querySelector('#btn-download-merge')
const btnDownloadMore = document.querySelector('#btn-download-more')
const myVideo = document.querySelector('#my-recording')
const myAudio = document.querySelector('#my-audio')

let playBack = false
let videoMediaRecorder = undefined
let audioMediaRecorder = undefined

const ffmpeg = createFFmpeg({ log: true })

const loadFfmpeg = async () => {
  await ffmpeg.load()
  btnStartRecord.removeAttribute('disabled')
  btnStopRecord.setAttribute('disabled', 'disabled')
  btnMerge.setAttribute('disabled', 'disabled')
  btnPreview.setAttribute('disabled', 'disabled')
}

btnStartRecord.addEventListener('click', async (e) => {
  let flag = true
  if (myVideo.src) {
    flag = confirm(
      'Starting a new recording will overwrite your existing video and audio, are you sure you want to continue?'
    )
  }
  if (flag) {
    try {
      //TODO: allow the user to select if they want their webcam to be captured.
      //TODO: allow the user to select if they want noise suppression.
      //TODO: add 3 second countdown before recording starts.
      const audioRecording = await navigator.mediaDevices.getUserMedia({
        video: false, //webcam
        audio: true, //mic
      })

      const videoRecording = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
        },
        audio: {
          sampleRate: 44100,
        },
        surfaceSwitching: 'include',
        selfBrowserSurface: 'exclude',
        systemAudio: 'include',
      })

      btnStartRecord.setAttribute('disabled', 'disabled')

      const videoData = []
      videoMediaRecorder = new MediaRecorder(videoRecording)

      const audioData = []
      audioMediaRecorder = new MediaRecorder(audioRecording)

      videoMediaRecorder.ondataavailable = (e) => {
        videoData.push(e.data)
      }

      audioMediaRecorder.ondataavailable = (e) => {
        audioData.push(e.data)
      }

      videoMediaRecorder.start()
      audioMediaRecorder.start()

      setTimeout(() => {
        videoMediaRecorder.stop()
        audioMediaRecorder.stop()
      }, 10000)

      videoMediaRecorder.onstop = () => {
        audioMediaRecorder.stop()
        myVideo.src = URL.createObjectURL(
          new Blob(videoData, {
            type: videoData[0].type,
          })
        )
        btnDownloadVideo.href = myVideo.src
      }

      audioMediaRecorder.onstop = () => {
        myAudio.src = URL.createObjectURL(
          new Blob(audioData, {
            type: audioData[0].type,
          })
        )
        btnDownloadAudio.href = myAudio.src
        btnMerge.removeAttribute('disabled')
        btnStartRecord.removeAttribute('disabled')
        btnPreview.removeAttribute('disabled')
        btnDownloadMore.removeAttribute('disabled')
        btnDownloadAudio.setAttribute('aria-disabled', 'false')
        btnDownloadVideo.setAttribute('aria-disabled', 'false')
      }

      btnStopRecord.removeAttribute('disabled')
    } catch (err) {
      console.error(err)
    }
  }
})

btnMerge.addEventListener('click', async (e) => {
  ffmpeg.FS('writeFile', 'video.webm', await fetchFile(myVideo.src))
  ffmpeg.FS('writeFile', 'audio.ogg', await fetchFile(myAudio.src))

  await ffmpeg.run(
    '-i',
    'video.webm',
    '-i',
    'audio.ogg',
    '-c:v',
    'libx264',
    '-c:a',
    'copy',
    'output.mp4'
  )

  const data = ffmpeg.FS('readFile', 'output.mp4')

  const url = URL.createObjectURL(
    new Blob([data.buffer], { type: 'video/mp4' })
  )
  btnDownloadMerge.href = url
  btnMerge.setAttribute('aria-disabled', 'false')
})

btnStopRecord.addEventListener('click', (e) => {
  //stop
  videoMediaRecorder.stop()
  audioMediaRecorder.stop()
})

btnPreview.addEventListener('click', () => {
  if (!playBack) {
    myVideo.currentTime = 0
    myAudio.currentTime = 0
    myVideo.play()
    myAudio.play()
    playBack = true
  } else {
    myVideo.pause()
    myAudio.pause()
    playBack = false
  }
})

loadFfmpeg()
