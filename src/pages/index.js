import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Image from "../components/image"

const IndexPage = () => {
    return (
      <Layout>
        <SEO title="Inicio"/>
        <div>
          <h1>Este es el incio de mi blog personal</h1>
          <p>Este es un parrafo</p>
        </div>
        <Link to="/page-2/">Ir a la pagina 2</Link>
        <br/>
        <Link to="/about/">Ir a nosotros</Link>
        <Image/>
      </Layout>
    )
}

export default IndexPage