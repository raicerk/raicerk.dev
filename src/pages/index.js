import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout/layout"
import SEO from "../components/seo/seo"
import Image from "../components/image/image"

import Code from "../components/code/code"

const IndexPage = () => {
  return (
    <Layout>
      <SEO title="Inicio" />
      <Code
        code={`
const welcome = () => {
  const blog = []
  const languages = ['JavaScript', 'TypeScript', 'Python', 'PHP']
  const frameworks_libraries = ['Angular', 'React', 'Vuejs', 'Nodejs', 'Express']
  const databases = ['MongoDB', 'Firebase Realtime', 'Firebase FireStore', 'Postgres']
  return blog.concat(languages, frameworks_libraries, databases)
}
`}
      />
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
