import { useCodelessStore } from '@/stores/codeless'
import {
  CircularProgress,
  Container,
  Drawer,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { Message } from 'ai'
import axios from 'axios'
import { FC, useEffect, useRef, useState } from 'react'

interface Component {
  name: string
  html: string
}

export const Browse: FC = () => {
  const showComponents = useCodelessStore((state) => state.showComponents)
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)
  const setHtml = useCodelessStore((state) => state.setHtml)
  // const setMessages = useCodelessStore((state) => state.setMessages)
  const setStep = useCodelessStore((state) => state.setStep)
  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const frameRefs = useRef<HTMLIFrameElement[]>([])

  const [components, setComponents] = useState<Component[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const handleLoadComponent = async (component: string) => {
    setShowComponents(false)

    setIsLoading(true)

    const res = await axios({
      method: 'POST',
      url: '/api/component/loadComponent',
      data: {
        component,
      },
    })
    const data = res.data as {
      steps: {
        number: number
        html: string
        messages: Message[]
      }[]
    }

    const latestStep = data.steps.sort((a, b) => b.number - a.number)[0]
    setHtml(latestStep.html)
    // setMessages(data.steps.flatMap((step) => step.messages))
    setStep(data.steps.length)
    setNumberOfSteps(data.steps.length)

    setIsLoading(false)
  }

  const init = async () => {
    const res = await axios({
      method: 'POST',
      url: '/api/component/listComponents',
    })

    setComponents(res.data.components)

    setIsInitialized(true)
  }

  useEffect(() => {
    frameRefs.current.forEach((element, index) => {
      element.src =
        'data:text/html;charset=utf-8,' +
        escape(`<!doctype html>
        <html>
        <head>
          <base href="http://localhost:3000/" />
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="background-color: #FFF">
          ${components[index].html}
        </body>
        </html>`)
    })
  }, [components, frameRefs])

  useEffect(() => {
    init()
  }, [])

  if (!isInitialized) {
    return (
      <Stack alignItems="center" p={5}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <>
      <Drawer
        anchor="bottom"
        open={showComponents}
        onClose={() => setShowComponents(false)}
      >
        <Stack p={2}>
          <Container maxWidth="xl">
            <Typography component="h3" mb={4} variant="h4">
              My Components
            </Typography>
            <Grid
              container
              sx={{
                border: '1px #CCC solid',
              }}
            >
              {components.map((component, index) => (
                <Grid
                  item
                  key={component.name}
                  xs={4}
                  sx={{
                    overflow: 'hidden',
                    border: '1px #CCC solid',
                    position: 'relative',
                    height: '300px',
                  }}
                >
                  <iframe
                    frameBorder={0}
                    ref={(ref) => {
                      ;(frameRefs.current as any)[index] = ref
                    }}
                    height="100%"
                    width="100%"
                  />
                  <button
                    onClick={() => handleLoadComponent(component.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Stack>
      </Drawer>
    </>
  )
}
