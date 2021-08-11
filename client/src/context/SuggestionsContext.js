import * as React from 'react';


const SuggestionsContext = React.createContext()

function SuggestionsProvider(props){
    const [suggestToken, setSuggestToken] = React.useState(null)

    const handleSetSuggestToken = (token) => {
        setSuggestToken(token)
    }

    return <SuggestionsContext.Provider value={{suggestToken, handleSetSuggestToken}} />

}

const useSuggestionsToken = ()=> React.useContext(SuggestionsContext)

export {SuggestionsProvider, useSuggestionsToken}