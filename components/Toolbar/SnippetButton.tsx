import { useCodelessStore } from '@/stores/codeless'
import { AdsClick as AdsClickIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { useSession } from 'next-auth/react'
import { FC, useEffect, useState } from 'react'

export const SnippetButton: FC = () => {
  const { data: session } = useSession()

  const isLoading = useCodelessStore((state) => state.isLoading)

  const user = useCodelessStore((state) => state.user)

  const snippetIsEnabled = useCodelessStore((state) => state.snippetIsEnabled)
  const setSnippetIsEnabled = useCodelessStore(
    (state) => state.setSnippetIsEnabled
  )

  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    setIsDisabled(isLoading || user.username !== session?.user?.email)
  }, [isLoading, session, user])

  return (
    <Tooltip title="Select Element">
      <span>
        <IconButton
          disabled={isDisabled}
          onClick={() => setSnippetIsEnabled(!snippetIsEnabled)}
        >
          <AdsClickIcon
            sx={{
              color: isDisabled ? 'gray' : snippetIsEnabled ? 'blue' : 'white',
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  )
}
