import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { GraphQLClient, gql } from 'graphql-request'
import { useState } from 'react'

const axios = require('axios').default;

function getBio(username: string): boolean {
  console.log(`Grabbing bio for @${username}`)
  const TWT_ENDPOINT = `https://api.twitter.com/2/users/by/username/${username}?user.fields=description`
  // const TWT_ENDPOINT = "https://slingy-bird-leaderboard.herokuapp.com/full?page=2&rows=3&construct=1"
  var wasSuccess = false

  axios.get(TWT_ENDPOINT, {
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TWITTER_API}`,
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Credentials": true,
      // "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method",
      "Content-Type": "application/json"
      // "Content-Type": "application/x-www-form-urlencoded",
      // "Accept": "application/json",
    },
    timeout: 1000,
    responseType: "json"
  })
  .then(function (response: any) {
    console.log(response)
    alert(response.toString())
    wasSuccess = true
  })
  .catch(function (error: any) {
    if (error.response) {
      // Request made and server responded
      console.log('request made and server responded')
      // console.log(error.response)
      // console.log('data', error.response.data);
      // console.log('status', error.response.status);
      // console.log('headers', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log("request made but no response received")
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    wasSuccess = false
  })
  return wasSuccess
}


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
            authorizations(types:TWITTER) {
              externalUsername
            }
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
      const resultTxt = document.getElementById('result')
      if (resultTxt) {
        resultTxt.setAttribute('href', '')
        resultTxt.textContent = ''
      }

      if (gamers.length == 0) alert(`${tag} not found`)
      for (let index = 0; index < gamers.length; index++) {
        const gamer = gamers[index];
        console.log(gamer)
        if (gamer['user']) {
          const pronouns = gamer['user'].genderPronoun
          if (pronouns) alert(`${gamer['gamerTag']} uses ${pronouns} pronouns`)
          else {
            const connections = gamer['user']['authorizations']
            if (connections.length > 0) {
              const twitter = connections[0].externalUsername
              getBio(twitter)
              if (resultTxt) {
                resultTxt.setAttribute('href', `https://twitter.com/${twitter}`)
                resultTxt.textContent = `Pronouns not linked. Try checking their Twitter @${twitter}`
              }
            }
            else alert(`${gamer['gamerTag']} has not yet set their pronouns on SmashGG or Twitter`)
          }
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
  const [slug, setSlug] = useState(" ");
  function handleSlugInput(event: any) {
    setSlug(event.target.value)
  }
  function getSlug() {
    return slug
  }
  
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
    getPronouns(getSlug(), getTag())
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
          Enter a tourney slug and a player&apos;s tag below
        </p>

        <div className={styles.grid}>
          <input type="text" onChange={handleSlugInput} placeholder="Tourney (ex: genesis-8)"></input>
          <input type="text" onChange={handleTagInput} placeholder="Player Tag (ex: Polish)"></input>
          <button onClick={buttonHandler}>Get Pronouns</button>
        </div>

        <div className={styles.grid}>
          <a id="result" href=""></a>
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
