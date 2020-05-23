import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout/layout"
import SEO from "../components/seo/seo"

const entradasPage = ({ data }) => {
  if(data.markdownRemark){
    return (
      <Layout>
        <SEO title={data.markdownRemark.frontmatter.title} />
        <h1 className="name">{data.markdownRemark.frontmatter.title}</h1>
        <article className="content post">
          <div dangerouslySetInnerHTML = {{__html: data.markdownRemark.html}} />
        </article>
        <Link to="/">Go back to the homepage</Link>
      </Layout>
    )
  }else{
    return (
      <div>Aca no hay nada</div>
    )
  }
  
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
