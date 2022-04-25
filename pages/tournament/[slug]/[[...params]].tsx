import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../../../styles/Home.module.css'

import { GraphQLClient, gql } from 'graphql-request'
import { useState } from 'react'
import { useRouter } from 'next/router'


function getPronouns(slug: string, tag: string) {
  console.log(`slug/tag::${slug}/${tag}`)
  const ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      // authorization: `Bearer ${process.env.SGG_API}`,
      "Content-Type": "application/json"
    },
  })
  // console.log(process.env.NEXT_PUBLIC_SGG_API)
  // console.log(process.env.SGG_API)
  var query = gql`
  query GetPronouns($slug: String!, $tag: String!) {
    tournament(slug: $slug) {
      participants(query: {
        filter: {
          gamerTag: $tag
        }
      }) {
        nodes {
          gamerTag
          user {
            genderPronoun
          }
        }
      }
    }
  }`
  var variables = {
    slug: slug,
    tag: tag
  }

  if (slug.trim() != "" && tag.trim() != "") {
    console.log("gql request sent")
  
    client.request(query, variables).then((data) => {
      console.log("gql request received")
      // console.log(data)
      const gamers = data['tournament']['participants']['nodes']
      if (gamers.length == 0) alert(`${tag} not found`)
      for (let index = 0; index < gamers.length; index++) {
        const gamer = gamers[index];
        // console.log(gamer)
        if (gamer['user']) {
          const pronouns = gamer['user'].genderPronoun
          // if (pronouns) console.log(`${gamer['gamerTag']} uses ${pronouns} pronouns`)
          // else console.log(`${gamer['gamerTag']} has not set their pronouns`)
          if (pronouns) alert(`${gamer['gamerTag']} uses ${pronouns} pronouns`)
          else alert(`${gamer['gamerTag']} has not yet set their pronouns on SmashGG`)
        } else {
          alert(`${tag} not found`)
        }
      }
    })
  } else {
    alert("Both textboxes must be filled")
  }

}

const Home: NextPage = () => {
  
  const router = useRouter()
  const { slug } = router.query
  
  const [tag, setTag] = useState(" ");
  function handleTagInput(event: any) {
    setTag(event.target.value)
  }
  function getTag() {
    return tag
  }

  const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    const button: HTMLButtonElement = event.currentTarget;
    if (slug) {
      console.log(slug)
      getPronouns(slug.toString(), getTag())
    }
  };

    
  return (
    <div className={styles.container}>
      <Head>
        <title>PronounsGG</title>
        <meta name="description" content="A player pronouns lookup tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to the Pronoun Zone!
        </h1>

        <p className={styles.description}>
          Enter a player's tag below
        </p>

        <div className={styles.grid}>
          <input type="text" onChange={handleTagInput} placeholder="Player Tag (ex: Polish)"></input>
          <button onClick={buttonHandler}>Get Pronouns</button>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
