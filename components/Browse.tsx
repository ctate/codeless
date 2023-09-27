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
  id: string
  image: string
}

export const Browse: FC = () => {
  const showComponents = useCodelessStore((state) => state.showComponents)
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)
  const load = useCodelessStore((state) => state.load)
  // const setMessages = useCodelessStore((state) => state.setMessages)
  const setStep = useCodelessStore((state) => state.setStep)
  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const frameRefs = useRef<HTMLIFrameElement[]>([])

  const [components, setComponents] = useState<Component[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const handleLoadComponent = async (component: string) => {
    setShowComponents(false)

    setIsLoading(true)

    await load(component)

    history.pushState({}, '', component)

    setIsLoading(false)
  }

  const init = async () => {
    const res = await axios({
      method: 'POST',
      url: '/api/code/listCode',
    })

    setComponents(
      res.data.code.map((c: any) => ({
        id: c.id.slice(5),
        image: c.image,
      }))
    )

    setIsInitialized(true)
  }

  useEffect(() => {
    if (showComponents) {
      init()
    }
  }, [showComponents])

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
                  key={component.id}
                  xs={4}
                  sx={{
                    overflow: 'hidden',
                    border: '1px #CCC solid',
                    position: 'relative',
                    height: '300px',
                  }}
                >
                  <img
                    src={component.image}
                    style={{ objectFit: 'cover' }}
                    width="100%"
                    height="100%"
                  />
                  <button
                    onClick={() => handleLoadComponent(component.id)}
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
