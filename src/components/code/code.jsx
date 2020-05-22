import PropTypes from "prop-types"
import React from "react"

import "@deckdeckgo/highlight-code"
import { defineCustomElements as deckDeckGoHighlightElement } from "@deckdeckgo/highlight-code/dist/loader"

import "./code.css"

const Codigo = ({ code }) => {
  deckDeckGoHighlightElement()
  return (
    <div>
      <deckgo-highlight-code>
        <code slot="code">{code}</code>
      </deckgo-highlight-code>
    </div>
  )
}

Codigo.propTypes = {
  code: PropTypes.string,
}

Codigo.defaultProps = {
  code: ``,
}

export default Codigo
