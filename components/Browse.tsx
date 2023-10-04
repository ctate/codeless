import { useCodelessStore } from '@/stores/codeless'
import {
  Avatar,
  CircularProgress,
  Container,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { Message } from 'ai'
import axios from 'axios'
import { FC, useEffect, useRef, useState } from 'react'
import { ExternalLink } from './ExternalLink'
import { Close } from '@mui/icons-material'

interface Component {
  id: number
  title: string
  slug: string
  createdAt: number
  imageUrl: string
  avatar: string
  username: string
}

export const Browse: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const showComponents = useCodelessStore((state) => state.showComponents)
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)
  const load = useCodelessStore((state) => state.load)

  const [projects, setComponents] = useState<Component[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  const handleLoadComponent = async (project: string) => {
    setShowComponents(false)

    setIsLoading(true)

    await load(project)

    history.pushState({}, '', `/code/${project}`)

    setIsLoading(false)
  }

  const init = async () => {
    setIsLoadingBrowse(true)

    const res = await axios({
      method: 'POST',
      url: '/api/project/listProjects',
    })

    setComponents(
      res.data.code.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        createdAt: c.createdAt,
        imageUrl: c.imageUrl,
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
              direction={onlySmallScreen ? 'column' : 'row'}
              justifyContent="space-between"
            >
              <Typography
                component="h3"
                mb={onlySmallScreen ? 0 : 4}
                variant="h4"
              >
                Browse
              </Typography>
              <Stack
                alignItems="center"
                direction="row"
                gap={2}
                mb={onlySmallScreen ? 4 : 0}
              >
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
                {projects
                  .sort((a, b) =>
                    sortBy === 'newest'
                      ? b.createdAt - a.createdAt
                      : sortBy === 'oldest'
                      ? a.createdAt - b.createdAt
                      : a.title.localeCompare(b.title)
                  )
                  .map((project, index) => (
                    <Grid item key={project.id} lg={4} md={6} sm={12}>
                      <Stack alignItems="center" direction="row" mb={1} gap={1}>
                        <ExternalLink
                          href={`https://github.com/${project.username}`}
                        >
                          <Avatar
                            src={project.avatar}
                            sx={{ width: 24, height: 24 }}
                          />
                        </ExternalLink>
                        <Typography variant="body2" style={{ color: 'black' }}>
                          {project.title}
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
                        }}
                      >
                        {project.imageUrl ? (
                          <a href={`/code/${project.slug}`}>
                            <img
                              src={project.imageUrl}
                              width="100%"
                              style={{ display: 'block' }}
                            />
                          </a>
                        ) : (
                          <a href={`/code/${project.slug}`}>
                            <img
                              src="/images/screenshot-blank.png"
                              width="100%"
                              style={{ display: 'block' }}
                            />
                            <Stack
                              alignItems="center"
                              height="100%"
                              justifyContent="center"
                              position="absolute"
                              left={0}
                              right={0}
                              top={0}
                              bottom={0}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: 'black' }}
                              >
                                Preview not available
                              </Typography>
                            </Stack>
                          </a>
                        )}
                      </Stack>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Container>
        </Stack>
      </Drawer>
      {showComponents && (
        <>
          <Stack
            direction="row"
            position="fixed"
            right={10}
            top={10}
            zIndex={100000000}
          >
            <IconButton onClick={() => setShowComponents(false)}>
              <Close style={{ color: 'black' }} />
            </IconButton>
          </Stack>
        </>
      )}
    </>
  )
}
