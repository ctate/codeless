import { useCodelessStore } from '@/stores/codeless'
import {
  BrowseGallery as BrowseGalleryIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import {
  Container,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'

export const HistoryButton: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const history = useCodelessStore((state) => state.history)

  const setCode = useCodelessStore((state) => state.setCode)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)

  const slug = useCodelessStore((state) => state.slug)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const versions = useCodelessStore((state) => state.versions)

  const [isDisabled, setIsDiabled] = useState(false)
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    setIsDiabled(isLoading || isSaving || !numberOfSteps)
  }, [isLoading, isSaving, numberOfSteps])

  return (
    <>
      <Tooltip title="Redo">
        <IconButton disabled={isDisabled} onClick={() => setShowVersions(true)}>
          <BrowseGalleryIcon
            sx={{
              color: isDisabled ? 'gray' : 'white',
            }}
          />
        </IconButton>
      </Tooltip>
      <Drawer
        anchor="bottom"
        onClose={() => setShowVersions(false)}
        open={showVersions}
      >
        <Stack p={2}>
          <Container maxWidth="xl">
            <Typography
              component="h3"
              mb={onlySmallScreen ? 0 : 4}
              variant="h4"
            >
              Iterations
            </Typography>
            <Grid container spacing={2}>
              {versions.map((version, index) => (
                <Grid item key={version.number} lg={3} md={4} sm={6} xs={12}>
                  <Stack alignItems="center" direction="row" mb={1} gap={0.5}>
                    <Typography
                      variant="body2"
                      style={{ color: 'black', fontWeight: 'bold' }}
                    >
                      #{version.number}
                    </Typography>
                    <Typography variant="body2" style={{ color: 'black' }}>
                      {version.prompt}
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
                    {version.imageUrl ? (
                      <img
                        src={version.imageUrl}
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center top',
                        }}
                        width="100%"
                        height="100%"
                      />
                    ) : (
                      <Stack
                        alignItems="center"
                        height="100%"
                        justifyContent="center"
                      >
                        <Typography variant="body2">
                          Preview not available
                        </Typography>
                      </Stack>
                    )}
                    <a
                      href={`/code/${slug}/${version.number}`}
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
          </Container>
        </Stack>
      </Drawer>
      {showVersions && (
        <>
          <Stack
            direction="row"
            position="fixed"
            right={10}
            top={10}
            zIndex={100000000}
          >
            <IconButton onClick={() => setShowVersions(false)}>
              <CloseIcon style={{ color: 'black' }} />
            </IconButton>
          </Stack>
        </>
      )}
    </>
  )
}
