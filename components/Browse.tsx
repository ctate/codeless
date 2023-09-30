import { useCodelessStore } from '@/stores/codeless'
import {
  Avatar,
  CircularProgress,
  Container,
  Drawer,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { Message } from 'ai'
import axios from 'axios'
import { FC, useEffect, useRef, useState } from 'react'
import { ExternalLink } from './ExternalLink'

interface Component {
  id: string
  title: string
  createdAt: number
  image: string
  avatar: string
  username: string
}

export const Browse: FC = () => {
  const showComponents = useCodelessStore((state) => state.showComponents)
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)
  const load = useCodelessStore((state) => state.load)

  const [components, setComponents] = useState<Component[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  const handleLoadComponent = async (component: string) => {
    setShowComponents(false)

    setIsLoading(true)

    await load(component)

    history.pushState({}, '', `/code/${component}`)

    setIsLoading(false)
  }

  const init = async () => {
    setIsLoadingBrowse(true)

    const res = await axios({
      method: 'POST',
      url: '/api/code/listCode',
    })

    setComponents(
      res.data.code.map((c: any) => ({
        id: c.id.slice(5),
        title: c.title,
        createdAt: c.createdAt,
        image: c.image,
        avatar: c.avatar,
        username: c.username,
      }))
    )

    setIsInitialized(true)
    setIsLoadingBrowse(false)
  }

  useEffect(() => {
    if (showComponents && !isInitialized) {
      init()
    }
  }, [isInitialized, showComponents])

  return (
    <>
      <Drawer
        anchor="bottom"
        open={showComponents}
        onClose={() => setShowComponents(false)}
      >
        <Stack p={2}>
          <Container maxWidth="xl">
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Typography component="h3" mb={4} variant="h4">
                Browse
              </Typography>
              <Stack alignItems="center" direction="row" gap={2}>
                <Typography>Sort by:</Typography>
                <button
                  onClick={() => setSortBy('newest')}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    borderBottom:
                      sortBy === 'newest'
                        ? '1px dotted #CCC'
                        : '1px solid transparent',
                  }}
                >
                  <Typography>Newest</Typography>
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    borderBottom:
                      sortBy === 'oldest'
                        ? '1px dotted #CCC'
                        : '1px solid transparent',
                  }}
                >
                  <Typography>Oldest</Typography>
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    borderBottom:
                      sortBy === 'name'
                        ? '1px dotted #CCC'
                        : '1px solid transparent',
                  }}
                >
                  <Typography>Name</Typography>
                </button>
              </Stack>
            </Stack>
            {isLoadingBrowse && (
              <Stack alignItems="center" p={5}>
                <CircularProgress sx={{ color: 'black' }} />
              </Stack>
            )}
            {!isLoadingBrowse && (
              <Grid container spacing={2}>
                {components
                  .sort((a, b) =>
                    sortBy === 'newest'
                      ? b.createdAt - a.createdAt
                      : sortBy === 'oldest'
                      ? a.createdAt - b.createdAt
                      : a.title.localeCompare(b.title)
                  )
                  .map((component, index) => (
                    <Grid item key={component.id} lg={4} md={6} sm={12}>
                      <Stack alignItems="center" direction="row" mb={1} gap={1}>
                        <ExternalLink
                          href={`https://github.com/${component.username}`}
                        >
                          <Avatar
                            src={component.avatar}
                            sx={{ width: 24, height: 24 }}
                          />
                        </ExternalLink>
                        <Typography variant="body2" style={{ color: 'black' }}>
                          {component.title}
                        </Typography>
                      </Stack>
                      <Stack
                        my={1}
                        sx={{
                          '&:hover': {
                            border: '1px #CCC solid',
                          },
                          border: '1px #EEE solid',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          position: 'relative',
                          height: '250px',
                        }}
                      >
                        <img
                          src={component.image}
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center top',
                          }}
                          width="100%"
                          height="100%"
                        />
                        <a
                          href={`/code/${component.id}`}
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
                      </Stack>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Container>
        </Stack>
      </Drawer>
    </>
  )
}
