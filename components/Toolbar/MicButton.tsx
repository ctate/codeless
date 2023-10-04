import { useCodelessStore } from '@/stores/codeless'
import { Mic, MicNone } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { FC, useEffect, useState } from 'react'

let mediaRecorder: MediaRecorder | null = null
let audioChunks: BlobPart[] = []

export const MicButton: FC = () => {
  const { data: session } = useSession()

  const isLoading = useCodelessStore((state) => state.isLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)

  const text = useCodelessStore((state) => state.text)
  const setText = useCodelessStore((state) => state.setText)

  const user = useCodelessStore((state) => state.user)

  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')

  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    setIsDisabled(isLoading || user.username !== session?.user?.email)
  }, [isLoading, session, user])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)
      setAudioURL(url)

      uploadAudio(audioBlob)
    }

    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
    }
    setIsRecording(false)
  }

  const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'myRecording.wav')

    const response = await axios.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    setText(response.data.text)
  }

  //   useEffect(() => {
  //     if (audioURL && input) {
  //       const mockEvent = {
  //         preventDefault: () => {},
  //         currentTarget: document.createElement('form'),
  //       } as React.FormEvent<HTMLFormElement>

  //       const newMessages = messages.slice()
  //       newMessages.push({
  //         id: `${Math.random()}`,
  //         role: 'user',
  //         content: input,
  //       })

  //       handleSubmit(mockEvent, {
  //         options: {
  //           body: {
  //             id,
  //             messages: newMessages,
  //             model,
  //             step,
  //           },
  //         },
  //       })

  //       setText('')
  //     }
  //   }, [audioURL, handleSubmit, id, input, messages, model, setText, step])

  useEffect(() => {
    if (isLoading) {
      setAudioURL('')
    }
  }, [isLoading])

  return (
    <>
      {!text.length && !isLoading && !isSaving && (
        <IconButton
          disabled={isDisabled}
          onClick={isRecording ? () => stopRecording() : () => startRecording()}
          sx={{ position: 'absolute', right: 25, top: 9.5 }}
        >
          {isRecording ? (
            <MicNone sx={{ color: 'white' }} />
          ) : (
            <Mic sx={{ color: isDisabled ? 'gray' : 'white' }} />
          )}
        </IconButton>
      )}
    </>
  )
}
