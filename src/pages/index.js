import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout/layout"
import SEO from "../components/seo/seo"

import Code from "../components/code/code"

const IndexPage = ({data}) => {
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
        <br/>
        <h1>welcome();</h1>
        <section className="blog container has-text-centered">
          {data.allMarkdownRemark.edges.map(post => (
            
              <Link key={post.node.id} to={post.node.frontmatter.path} style={{
                display: "block",
                margin: "0 0 1rem 0"
              }}>
                &lt;article&gt;
                <article>
                  <h3>{post.node.frontmatter.title}</h3>
                  <p>{post.node.frontmatter.description}</p>
                </article>
                &lt;/article&gt;
              </Link>
            
          ))}
        </section>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql `
  query IndexQuery {
    allMarkdownRemark(
      limit: 10
      sort: { fields: [frontmatter___date], order: DESC}
      filter: {frontmatter: {published: {eq: true}}}) {
      edges {
        node {
          id
          frontmatter {
            title
            path
            description
            date
          }
        }
      }
    }
  }
`

export default IndexPage
