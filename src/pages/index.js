import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Image from "../components/image"

import "@deckdeckgo/highlight-code"
import { defineCustomElements as deckDeckGoHighlightElement } from "@deckdeckgo/highlight-code/dist/loader"

const IndexPage = () => {
  deckDeckGoHighlightElement()
  return (
    <Layout>
      <SEO title="Inicio" />

      <div>
        <deckgo-highlight-code>
          <code slot="code">
            {
              `
const constante = () => {
  return true
}
              `
            }
          </code>
        </deckgo-highlight-code>
      </div>
      <div>
        <h1>Este es el incio de mi blog personal</h1>
        <p>Este es un parrafo</p>
      </div>
      <Link to="/page-2/">Ir a la pagina 2</Link>
      <br />
      <Link to="/about/">Ir a nosotros</Link>
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
      </div>
    </Layout>
  )
}

export default IndexPage
