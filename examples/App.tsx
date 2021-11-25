import * as React from 'react'
import withActions, { ActionPropType } from 'react-fetch-decorator'

const App = ({ fetchDogAction }: { fetchDogAction: ActionPropType }) => {
  const { isPending, isFailed, isSucceded, error, result } = fetchDogAction

  const handleClick = React.useCallback(() => {
    fetchDogAction.run({ silent: true })
  }, [fetchDogAction.run])

  return (
    <>
      <button type="button" onClick={handleClick}>
        Fetch Dog (multiple requests will be aborted)
      </button>

      <hr />

      {isPending && (
        <div style={{ color: 'blue' }}>
          Loading...
        </div>
      )}

      {isFailed && (
        <div style={{ color: 'red' }}>
          {error.message}
        </div>
      )}

      {isSucceded && (
        <>
          <div style={{ color: 'green' }}>
            Succeded!
          </div>
          <img
            alt="dog"
            src={result.message}
          />
        </>
      )}
    </>
  )
}

const mapActionsToProps = {
  fetchDogAction: async (signal) => {
    const response = await fetch('https://dog.ceo/api/breeds/image/random', { signal })
    return response.json()
  },
}

export default withActions(mapActionsToProps)(App)
