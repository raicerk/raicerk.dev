import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout/layout"
import SEO from "../components/seo/seo"

const entradasPage = ({ data }) => {
  const post = data.markdownRemark
  return (
    <Layout>
      <SEO title="Page two" />
      <h1 className="name">{post.frontmatter.title}</h1>
      <article className="content post">
        <div dangerouslySetInnerHTML = {{__html: post.html}} />
      </article>
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default entradasPage

export const postQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
      }
    }
  }
`
