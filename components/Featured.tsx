import { useCodelessStore } from '@/stores/codeless'
import { Apps } from '@mui/icons-material'
import {
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { FC } from 'react'

const featuredCode = [
  {
    id: 'earth-trivia',
    name: 'Earth Trivia',
    image:
      'https://43fzijkfwg2zmvr5.public.blob.vercel-storage.com/code/trivia-game-1695828100712-fNApDbJPHD6VewEn2k9MfORRdvhCRC',
  },
  {
    id: 'slithering-serpent',
    name: 'Slithering Serpent',
    image:
      'https://43fzijkfwg2zmvr5.public.blob.vercel-storage.com/projects/273/versions/2/screenshot-Un5fEH1aZW5drHXv6VzIhJ1s3Q2hPd.png',
  },
  {
    id: 'twinkling-stars',
    name: 'Twinkling Stars',
    image:
      'https://43fzijkfwg2zmvr5.public.blob.vercel-storage.com/code/twinkling-stars-1695819029214-8Ys4DzdJ4qDn0917YQz64HSWg7ciMa',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    image:
      'https://43fzijkfwg2zmvr5.public.blob.vercel-storage.com/code/working-calculator-1695837997818-Q7BOn01OwR9mREDdS7s29VWJ3H52Oe',
  },
]

export const Featured: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const id = useCodelessStore((state) => state.id)

  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const load = useCodelessStore((state) => state.load)

  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const handleLoadComponent = async (component: string) => {
    setShowComponents(false)

    setIsLoading(true)

    await load(component)

    history.pushState({}, '', `/code/${component}`)

    setIsLoading(false)
  }

  if (!!id) {
    return null
  }
  return (
    <Stack
      position={onlySmallScreen ? 'static' : 'fixed'}
      bottom={20}
      paddingBottom={onlySmallScreen ? '20px' : 0}
    >
      <Container maxWidth="md">
        <Stack mt={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography gutterBottom variant="h5">
              Featured
            </Typography>

            <Button onClick={() => setShowComponents(true)}>
              <Stack alignItems="center" direction="row" gap={1}>
                <Typography textTransform="none" sx={{ color: 'white' }}>
                  Browse All
                </Typography>
                <Apps sx={{ color: 'white' }} />
              </Stack>
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {featuredCode.map((featured) => (
              <Grid item sm={3} xs={12} key={featured.id}>
                <Stack
                  sx={{
                    '&:hover': {
                      border: '1px #666 solid',
                    },
                    border: '1px #333 solid',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    position: 'relative',
                    height: onlySmallScreen ? '240px' : '140px',
                  }}
                >
                  <img
                    src={featured.image}
                    style={{
                      objectFit: 'cover',
                    }}
                    width="100%"
                    height="100%"
                  />
                  <a
                    href={`/code/${featured.id}`}
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
                <Typography
                  mt={1}
                  textAlign="center"
                  variant="body2"
                >
                  {featured.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Stack>
  )
}
