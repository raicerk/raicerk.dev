import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout/layout"
import SEO from "../components/seo/seo"

const AboutPage = () => (
  <Layout>
    <SEO title="About" />
    <div style={{ color: `teal` }}>
    <h1>About Gatsby</h1>
    <p>Such wow. Very React.</p>
  </div>
    <Link to="/">Go to home</Link>
  </Layout>
)

export default AboutPage