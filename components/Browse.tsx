import { Close, ForkLeft, ForkRight, Star } from '@mui/icons-material'
import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'

import { ExternalLink } from '@/components/ExternalLink'
import { useCodelessStore } from '@/stores/codeless'

interface Project {
  id: number
  title: string
  slug: string
  starCount: number
  createdAt: number
  imageUrl: string
  avatar: string
  username: string
  isStarred: boolean
}

export const Browse: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const showComponents = useCodelessStore((state) => state.showComponents)
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)
  const load = useCodelessStore((state) => state.load)

  const [projects, setProjects] = useState<Project[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadingForks, setLoadingForks] = useState<number[]>([])
  const [loadingStars, setLoadingStars] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'stars' | 'newest' | 'oldest' | 'name'>(
    'stars'
  )

  const handleFork = async (projectId: number) => {
    if (loadingForks.includes(projectId)) {
      return
    }

    setLoadingForks(loadingForks.concat(projectId))

    const res = await axios({
      method: 'POST',
      url: '/api/project/forkProject',
      data: {
        id: projectId,
      },
    })

    window.location.href = `/code/${res.data.slug}`

    setLoadingForks(loadingForks.splice(loadingForks.indexOf(projectId), 1))
  }

  const handleLoadComponent = async (project: string) => {
    setShowComponents(false)

    setIsLoading(true)

    await load(project)

    history.pushState({}, '', `/code/${project}`)

    setIsLoading(false)
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)

    const newPage = page + 1

    const res = await axios({
      method: 'POST',
      url: '/api/project/listProjects',
      data: {
        page: newPage,
        limit: 24,
        sortBy,
      },
    })

    setProjects(
      projects.concat(
        res.data.code.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          starCount: c.starCount,
          createdAt: new Date(c.createdAt),
          imageUrl: c.imageUrl,
          avatar: c.avatar,
          username: c.username,
          isStarred: c.isStarred,
        }))
      )
    )

    setIsLoadingMore(false)
    setPage(newPage)
  }

  const handleStar = async (projectId: number, isStarred: boolean) => {
    if (loadingStars.includes(projectId)) {
      return
    }

    setLoadingStars(loadingStars.concat(projectId))

    try {
      await axios({
        method: 'POST',
        url: '/api/project/starProject',
        data: {
          projectId,
          status: isStarred ? 'unstar' : 'star',
        },
      })

      const projectIndex = projects.findIndex((p) => p.id === projectId)

      if (projectIndex > -1) {
        const res = await axios({
          method: 'POST',
          url: '/api/project/getProject',
          data: {
            slug: projects[projectIndex].slug,
          },
        })

        const updatedProjects = projects.slice()
        updatedProjects[projectIndex].isStarred = res.data.isStarred
        setProjects(updatedProjects)
      }
    } catch {}

    setLoadingStars(loadingStars.splice(loadingStars.indexOf(projectId), 1))
  }

  const init = async () => {
    setIsLoadingBrowse(true)

    const res = await axios({
      method: 'POST',
      url: '/api/project/listProjects',
      data: {
        page,
        limit: 24,
        sortBy,
      },
    })

    setProjects(
      res.data.code.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        starCount: c.starCount,
        createdAt: new Date(c.createdAt),
        imageUrl: c.imageUrl,
        avatar: c.avatar,
        username: c.username,
        isStarred: c.isStarred,
      }))
    )

    setIsInitialized(true)
    setIsLoadingBrowse(false)
  }

  useEffect(() => {
    if (showComponents) {
      init()
    }
  }, [showComponents, sortBy])

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
                  onClick={() => setSortBy('stars')}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    borderBottom:
                      sortBy === 'stars'
                        ? '1px dotted #CCC'
                        : '1px solid transparent',
                  }}
                >
                  <Typography>Stars</Typography>
                </button>
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
                {projects.map((project, index) => (
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
                      <Typography
                        flexGrow={1}
                        variant="body2"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        style={{ color: 'black' }}
                      >
                        {project.title}
                      </Typography>
                      {loadingForks.indexOf(project.id) !== -1 ? (
                        <Stack
                          alignItems="center"
                          height={40}
                          justifyContent="center"
                          width={40}
                        >
                          <CircularProgress
                            size={24}
                            sx={{
                              color: 'black',
                            }}
                          />
                        </Stack>
                      ) : (
                        <IconButton
                          disableRipple
                          onClick={() => handleFork(project.id)}
                        >
                          <Typography>Fork</Typography>
                          <ForkRight />
                        </IconButton>
                      )}
                      {loadingStars.indexOf(project.id) !== -1 ? (
                        <Stack
                          alignItems="center"
                          height={40}
                          justifyContent="center"
                          width={40}
                        >
                          <CircularProgress
                            size={24}
                            sx={{
                              color: 'black',
                            }}
                          />
                        </Stack>
                      ) : (
                        <Stack alignItems="center" direction="row">
                          <Typography>{project.starCount}</Typography>
                          <IconButton
                            disableRipple
                            onClick={() =>
                              handleStar(project.id, project.isStarred)
                            }
                          >
                            <Star
                              sx={{
                                color: project.isStarred ? 'orange' : null,
                              }}
                            />
                          </IconButton>
                        </Stack>
                      )}
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
                            <Typography variant="body2" sx={{ color: 'black' }}>
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
            <Stack alignItems="center" my={3}>
              {isLoadingMore ? (
                <CircularProgress sx={{ color: 'black' }} />
              ) : (
                <Button
                  color="primary"
                  onClick={handleLoadMore}
                  disableRipple
                  variant="outlined"
                >
                  Load More
                </Button>
              )}
            </Stack>
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
